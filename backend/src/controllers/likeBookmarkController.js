const { query } = require('../config/database');

const toggleLike = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const existing = await query('SELECT id FROM likes WHERE user_id = $1 AND post_id = $2', [req.user.id, postId]);
    if (existing.rows.length) {
      await query('DELETE FROM likes WHERE user_id = $1 AND post_id = $2', [req.user.id, postId]);
      const count = await query('SELECT COUNT(*) as count FROM likes WHERE post_id = $1', [postId]);
      return res.json({ success: true, liked: false, likeCount: parseInt(count.rows[0].count) });
    }
    await query('INSERT INTO likes (user_id, post_id) VALUES ($1, $2)', [req.user.id, postId]);
    const count = await query('SELECT COUNT(*) as count FROM likes WHERE post_id = $1', [postId]);
    res.json({ success: true, liked: true, likeCount: parseInt(count.rows[0].count) });
  } catch (err) {
    next(err);
  }
};

const toggleBookmark = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const existing = await query('SELECT id FROM bookmarks WHERE user_id = $1 AND post_id = $2', [req.user.id, postId]);
    if (existing.rows.length) {
      await query('DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2', [req.user.id, postId]);
      return res.json({ success: true, bookmarked: false });
    }
    await query('INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2)', [req.user.id, postId]);
    res.json({ success: true, bookmarked: true });
  } catch (err) {
    next(err);
  }
};

const getBookmarks = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const result = await query(
      `SELECT p.id, p.title, p.description, p.price, p.location, p.status, p.created_at,
              c.slug as category_slug, c.name as category_name, c.icon as category_icon,
              u.name as author_name, u.avatar_url as author_avatar,
              b.created_at as bookmarked_at,
              ARRAY_AGG(DISTINCT pi.url) FILTER (WHERE pi.url IS NOT NULL) as images
       FROM bookmarks b
       JOIN posts p ON p.id = b.post_id
       JOIN categories c ON c.id = p.category_id
       JOIN users u ON u.id = p.user_id
       LEFT JOIN post_images pi ON pi.post_id = p.id
       WHERE b.user_id = $1
       GROUP BY p.id, c.id, u.id, b.created_at
       ORDER BY b.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), offset]
    );
    const count = await query('SELECT COUNT(*) as total FROM bookmarks WHERE user_id = $1', [req.user.id]);
    res.json({
      success: true, data: result.rows,
      pagination: { total: parseInt(count.rows[0].total), page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { toggleLike, toggleBookmark, getBookmarks };
