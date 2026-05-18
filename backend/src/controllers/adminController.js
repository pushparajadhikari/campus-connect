const { query } = require('../config/database');

const getDashboardStats = async (req, res, next) => {
  try {
    const [users, posts, reports, recent] = await Promise.all([
      query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_this_week FROM users`),
      query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'active') as active, COUNT(*) FILTER (WHERE status = 'pending') as pending FROM posts`),
      query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'pending') as pending FROM reports`),
      query(`SELECT p.id, p.title, p.status, p.created_at, u.name as author, c.name as category
             FROM posts p JOIN users u ON u.id = p.user_id JOIN categories c ON c.id = p.category_id
             ORDER BY p.created_at DESC LIMIT 10`),
    ]);
    res.json({
      success: true,
      data: {
        stats: {
          users: users.rows[0],
          posts: posts.rows[0],
          reports: reports.rows[0],
        },
        recentPosts: recent.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) { conditions.push(`(name ILIKE $${idx} OR email ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    if (role) { conditions.push(`role = $${idx++}`); params.push(role); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await query(
      `SELECT id, name, email, role, department, year_of_study, is_active, created_at,
              (SELECT COUNT(*) FROM posts WHERE user_id = users.id) as post_count
       FROM users ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, parseInt(limit), offset]
    );
    const count = await query(`SELECT COUNT(*) as total FROM users ${where}`, params);
    res.json({
      success: true, data: result.rows,
      pagination: { total: parseInt(count.rows[0].total), page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    await query('UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2', [isActive, userId]);
    res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (err) {
    next(err);
  }
};

const moderatePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { status } = req.body;
    const allowed = ['active', 'closed', 'pending', 'rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    await query('UPDATE posts SET status = $1, updated_at = NOW() WHERE id = $2', [status, postId]);
    res.json({ success: true, message: 'Post status updated' });
  } catch (err) {
    next(err);
  }
};

const getReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let idx = 1;

    if (status) { conditions.push(`r.status = $${idx++}`); params.push(status); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT r.id, r.reason, r.description, r.status, r.created_at,
              u.name as reporter_name, u.email as reporter_email,
              p.title as post_title, p.id as post_id
       FROM reports r
       JOIN users u ON u.id = r.reporter_id
       LEFT JOIN posts p ON p.id = r.post_id
       ${where} ORDER BY r.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, parseInt(limit), offset]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

const resolveReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;
    await query('UPDATE reports SET status = $1 WHERE id = $2', [status, reportId]);
    res.json({ success: true, message: 'Report updated' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats, getUsers, updateUserStatus, moderatePost, getReports, resolveReport };
