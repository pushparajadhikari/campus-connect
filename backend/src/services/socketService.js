const { query } = require('../config/database');
const jwt = require('jsonwebtoken');

const setupSocket = (io) => {
  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await query('SELECT id, name, avatar_url FROM users WHERE id = $1 AND is_active = TRUE', [decoded.userId]);
      if (!result.rows.length) return next(new Error('User not found'));
      socket.user = result.rows[0];
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected (${socket.id})`);

    socket.on('join_room', async ({ roomId }) => {
      try {
        const member = await query(
          'SELECT id FROM chat_room_members WHERE room_id = $1 AND user_id = $2',
          [roomId, socket.user.id]
        );
        if (member.rows.length) {
          socket.join(`room:${roomId}`);
          socket.emit('joined_room', { roomId });
        }
      } catch (err) {
        socket.emit('error', { message: 'Could not join room' });
      }
    });

    socket.on('leave_room', ({ roomId }) => {
      socket.leave(`room:${roomId}`);
    });

    socket.on('send_message', async ({ roomId, content, messageType = 'text' }) => {
      try {
        if (!content || !content.trim()) return;

        const member = await query(
          'SELECT id FROM chat_room_members WHERE room_id = $1 AND user_id = $2',
          [roomId, socket.user.id]
        );
        if (!member.rows.length) {
          return socket.emit('error', { message: 'Not a member of this room' });
        }

        const result = await query(
          `INSERT INTO messages (room_id, sender_id, content, message_type) VALUES ($1, $2, $3, $4)
           RETURNING id, content, message_type, is_read, created_at`,
          [roomId, socket.user.id, content.trim(), messageType]
        );

        const message = {
          ...result.rows[0],
          sender_id: socket.user.id,
          sender_name: socket.user.name,
          sender_avatar: socket.user.avatar_url,
          room_id: roomId,
        };

        io.to(`room:${roomId}`).emit('new_message', message);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', ({ roomId, isTyping }) => {
      socket.to(`room:${roomId}`).emit('user_typing', {
        userId: socket.user.id,
        userName: socket.user.name,
        isTyping,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.user.name} disconnected`);
    });
  });
};

module.exports = { setupSocket };
