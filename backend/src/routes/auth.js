const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { uploadAvatar } = require('../middleware/upload');
const {
  register, login, getProfile, updateProfile, changePassword,
  registerValidation, loginValidation,
} = require('../controllers/authController');

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, uploadAvatar, updateProfile);
router.put('/change-password', authenticate, changePassword);

module.exports = router;
