const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getDashboardStats, getUsers, updateUserStatus, moderatePost, getReports, resolveReport } = require('../controllers/adminController');

router.use(authenticate, requireAdmin);
router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:userId/status', updateUserStatus);
router.put('/posts/:postId/status', moderatePost);
router.get('/reports', getReports);
router.put('/reports/:reportId', resolveReport);

module.exports = router;
