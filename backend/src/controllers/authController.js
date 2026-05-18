const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { query } = require('../config/database');

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('department').optional().trim().isLength({ max: 100 }),
  body('yearOfStudy').optional().isInt({ min: 1, max: 6 }),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

const register = async (req, res, next) => {
  try {
    const { name, email, password, department, yearOfStudy, studentId } = req.body;
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, department, year_of_study, student_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, avatar_url, department, year_of_study, created_at`,
      [name, email, passwordHash, department || null, yearOfStudy || null, studentId || null]
    );
    const user = result.rows[0];
    const token = generateToken(user.id);
    res.status(201).json({ success: true, message: 'Registration successful', data: { token, user } });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await query(
      'SELECT id, name, email, password_hash, role, avatar_url, department, year_of_study, is_active FROM users WHERE email = $1',
      [email]
    );
    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account deactivated' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const { password_hash, ...safeUser } = user;
    const token = generateToken(user.id);
    res.json({ success: true, message: 'Login successful', data: { token, user: safeUser } });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.bio, u.department,
              u.year_of_study, u.student_id, u.created_at,
              COUNT(DISTINCT p.id) as post_count,
              COUNT(DISTINCT b.id) as bookmark_count
       FROM users u
       LEFT JOIN posts p ON p.user_id = u.id AND p.status = 'active'
       LEFT JOIN bookmarks b ON b.user_id = u.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, department, yearOfStudy, studentId } = req.body;
    const avatarUrl = req.file
      ? `/uploads/avatars/${req.file.filename}`
      : undefined;

    const setClauses = [];
    const values = [];
    let idx = 1;

    if (name) { setClauses.push(`name = $${idx++}`); values.push(name); }
    if (bio !== undefined) { setClauses.push(`bio = $${idx++}`); values.push(bio); }
    if (department) { setClauses.push(`department = $${idx++}`); values.push(department); }
    if (yearOfStudy) { setClauses.push(`year_of_study = $${idx++}`); values.push(yearOfStudy); }
    if (studentId) { setClauses.push(`student_id = $${idx++}`); values.push(studentId); }
    if (avatarUrl) { setClauses.push(`avatar_url = $${idx++}`); values.push(avatarUrl); }
    setClauses.push(`updated_at = NOW()`);
    values.push(req.user.id);

    const result = await query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${idx}
       RETURNING id, name, email, role, avatar_url, bio, department, year_of_study, student_id`,
      values
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    const newHash = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, req.user.id]);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile, updateProfile, changePassword, registerValidation, loginValidation };
