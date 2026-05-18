const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getRooms, createRoom, getMessages } = require('../controllers/chatController');

router.use(authenticate);
router.get('/rooms', getRooms);
router.post('/rooms', createRoom);
router.get('/rooms/:roomId/messages', getMessages);

module.exports = router;
