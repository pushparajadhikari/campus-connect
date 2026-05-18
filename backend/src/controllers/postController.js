const { query } = require('../config/database');
const { body } = require('express-validator');
const path = require('path');

const postValidation = [
  body('title').trim().isLength({ min: 3, max: 255 }).withMessage('Title must be 3-255 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('categoryId').isInt({ min: 1 }).withMessage('Valid category required'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('location').optional().trim().isLength({ max: 200 }),
];

const POST_SELECT = `
  SELECT p.id, p.title, p.description, p.price, p.location, p.status,
         p.is_featured, p.view_count, p.contact_info, p.metadata, p.created_at, p.updated_at,
         c.id as category_id, c.slug as category_slug, c.name as category_name, c.icon as category_icon,
         u.id as author_id, u.name as author_name, u.avatar_url as author_avatar, u.department as author_dept,
         COUNT(DISTINCT l.id) as like_count,
         ARRAY_AGG(DISTINCT pi.url) FILTER (WHERE pi.url IS NOT NULL) as images,
         ARRAY_AGG(DISTINCT jsonb_build_object('url', pf.url, 'filename', pf.filename, 'file_type', pf.file_type)) 
           FILTER (WHERE pf.url IS NOT NULL) as files
  FROM posts p
  JOIN categories c ON c.id = p.category_id
  JOIN users u ON u.id = p.user_id
  LEFT JOIN likes l ON l.post_id = p.id
  LEFT JOIN post_images pi ON pi.post_id = p.id
  LEFT JOIN post_files pf ON pf.post_id = p.id
`;

const getPosts = async (req, res, next) => {
  try {
    const {
      category, search, location, status = 'active',
      page = 1, limit = 12, sort = 'newest',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = ["p.status = $1"];
    const params = [status];
    let idx = 2;

    if (category) { conditions.push(`c.slug = $${idx++}`); params.push(category); }
    if (location) { conditions.push(`p.location ILIKE $${idx++}`); params.push(`%${location}%`); }
    if (search) {
      conditions.push(`(p.title ILIKE $${idx} OR p.description ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const orderMap = {
      newest: 'p.created_at DESC',
      oldest: 'p.created_at ASC',
      price_asc: 'p.price ASC NULLS LAST',
      price_desc: 'p.price DESC NULLS LAST',
      popular: 'like_count DESC, p.created_at DESC',
    };
    const orderBy = orderMap[sort] || 'p.created_at DESC';

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const dataQuery = `
      ${POST_SELECT}
      ${where}
      GROUP BY p.id, c.id, u.id
      ORDER BY ${orderBy}
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(parseInt(limit), offset);

    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM posts p JOIN categories c ON c.id = p.category_id
      ${where}
    `;

    const [dataResult, countResult] = await Promise.all([
      query(dataQuery, params),
      query(countQuery, params.slice(0, params.length - 2)),
    ]);

    const total = parseInt(countResult.rows[0].total);
    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        total, page: parseInt(page), limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('UPDATE posts SET view_count = view_count + 1 WHERE id = $1', [id]);
    const result = await query(
      `${POST_SELECT} WHERE p.id = $1 GROUP BY p.id, c.id, u.id`,
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    // Check if user liked/bookmarked
    let liked = false, bookmarked = false;
    if (req.user) {
      const [likeRes, bookRes] = await Promise.all([
        query('SELECT id FROM likes WHERE user_id = $1 AND post_id = $2', [req.user.id, id]),
        query('SELECT id FROM bookmarks WHERE user_id = $1 AND post_id = $2', [req.user.id, id]),
      ]);
      liked = likeRes.rows.length > 0;
      bookmarked = bookRes.rows.length > 0;
    }
    res.json({ success: true, data: { ...result.rows[0], liked, bookmarked } });
  } catch (err) {
    next(err);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { title, description, categoryId, price, location, contactInfo, metadata } = req.body;
    const result = await query(
      `INSERT INTO posts (user_id, category_id, title, description, price, location, contact_info, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [req.user.id, categoryId, title, description, price || null, location || null,
       contactInfo || null, metadata ? JSON.stringify(metadata) : '{}']
    );
    const postId = result.rows[0].id;

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        await query(
          'INSERT INTO post_images (post_id, url, filename, is_primary) VALUES ($1, $2, $3, $4)',
          [postId, `/uploads/images/${file.filename}`, file.originalname, i === 0]
        );
      }
    }

    const postResult = await query(
      `${POST_SELECT} WHERE p.id = $1 GROUP BY p.id, c.id, u.id`,
      [postId]
    );
    res.status(201).json({ success: true, message: 'Post created successfully', data: postResult.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await query('SELECT user_id, status FROM posts WHERE id = $1', [id]);
    if (!post.rows.length) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (post.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, description, price, location, contactInfo, status, metadata } = req.body;
    const allowedStatuses = req.user.role === 'admin'
      ? ['active', 'closed', 'pending', 'rejected']
      : ['active', 'closed'];

    const setClauses = ['updated_at = NOW()'];
    const values = [];
    let idx = 1;

    if (title) { setClauses.push(`title = $${idx++}`); values.push(title); }
    if (description) { setClauses.push(`description = $${idx++}`); values.push(description); }
    if (price !== undefined) { setClauses.push(`price = $${idx++}`); values.push(price); }
    if (location !== undefined) { setClauses.push(`location = $${idx++}`); values.push(location); }
    if (contactInfo !== undefined) { setClauses.push(`contact_info = $${idx++}`); values.push(contactInfo); }
    if (status && allowedStatuses.includes(status)) { setClauses.push(`status = $${idx++}`); values.push(status); }
    if (metadata) { setClauses.push(`metadata = $${idx++}`); values.push(JSON.stringify(metadata)); }

    values.push(id);
    await query(`UPDATE posts SET ${setClauses.join(', ')} WHERE id = $${idx}`, values);

    const updated = await query(`${POST_SELECT} WHERE p.id = $1 GROUP BY p.id, c.id, u.id`, [id]);
    res.json({ success: true, data: updated.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await query('SELECT user_id FROM posts WHERE id = $1', [id]);
    if (!post.rows.length) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (post.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const getUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [dataResult, countResult] = await Promise.all([
      query(
        `${POST_SELECT} WHERE p.user_id = $1 GROUP BY p.id, c.id, u.id ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`,
        [userId, parseInt(limit), offset]
      ),
      query('SELECT COUNT(*) as total FROM posts WHERE user_id = $1', [userId]),
    ]);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: { total: parseInt(countResult.rows[0].total), page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT c.*, COUNT(p.id) as post_count
       FROM categories c LEFT JOIN posts p ON p.category_id = c.id AND p.status = 'active'
       GROUP BY c.id ORDER BY c.name`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPosts, getPost, createPost, updatePost, deletePost, getUserPosts, getCategories, postValidation };
