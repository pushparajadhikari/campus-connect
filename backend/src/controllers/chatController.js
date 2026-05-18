const { query } = require('../config/database');

const getRooms = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT cr.id, cr.name, cr.type, cr.created_at,
              (SELECT content FROM messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message,
              (SELECT created_at FROM messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
              COUNT(DISTINCT crm2.user_id) as member_count,
              json_agg(DISTINCT jsonb_build_object('id', u.id, 'name', u.name, 'avatar_url', u.avatar_url)) as members
       FROM chat_rooms cr
       JOIN chat_room_members crm ON crm.room_id = cr.id AND crm.user_id = $1
       JOIN chat_room_members crm2 ON crm2.room_id = cr.id
       JOIN users u ON u.id = crm2.user_id
       GROUP BY cr.id ORDER BY last_message_at DESC NULLS LAST`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

const createRoom = async (req, res, next) => {
  try {
    const { name, type = 'group', memberIds = [] } = req.body;

    // For direct messages, check if room already exists
    if (type === 'direct' && memberIds.length === 1) {
      const existing = await query(
        `SELECT cr.id FROM chat_rooms cr
         JOIN chat_room_members m1 ON m1.room_id = cr.id AND m1.user_id = $1
         JOIN chat_room_members m2 ON m2.room_id = cr.id AND m2.user_id = $2
         WHERE cr.type = 'direct'`,
        [req.user.id, memberIds[0]]
      );
      if (existing.rows.length) {
        return res.json({ success: true, data: { id: existing.rows[0].id } });
      }
    }

    const roomResult = await query(
      'INSERT INTO chat_rooms (name, type, created_by) VALUES ($1, $2, $3) RETURNING id',
      [name || null, type, req.user.id]
    );
    const roomId = roomResult.rows[0].id;

    const allMembers = [req.user.id, ...memberIds.filter(id => id !== req.user.id)];
    for (const uid of allMembers) {
      await query('INSERT INTO chat_room_members (room_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [roomId, uid]);
    }

    res.status(201).json({ success: true, data: { id: roomId } });
  } catch (err) {
    next(err);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { before, limit = 50 } = req.query;

    // Verify member
    const member = await query('SELECT id FROM chat_room_members WHERE room_id = $1 AND user_id = $2', [roomId, req.user.id]);
    if (!member.rows.length) {
      return res.status(403).json({ success: false, message: 'Not a member of this room' });
    }

    const params = [roomId, parseInt(limit)];
    let beforeClause = '';
    if (before) { beforeClause = `AND m.created_at < $3`; params.push(before); }

    const result = await query(
      `SELECT m.id, m.content, m.message_type, m.is_read, m.created_at,
              u.id as sender_id, u.name as sender_name, u.avatar_url as sender_avatar
       FROM messages m JOIN users u ON u.id = m.sender_id
       WHERE m.room_id = $1 ${beforeClause}
       ORDER BY m.created_at DESC LIMIT $2`,
      params
    );
    res.json({ success: true, data: result.rows.reverse() });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRooms, createRoom, getMessages };
