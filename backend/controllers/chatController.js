const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class ChatController {
  async getRoomMessages(req, res) {
    const { roomId } = req.params;
    const limit = req.query.limit || 50;

    const result = await pool.query(
      `SELECT m.*, p.username, p.avatar
       FROM messages m
       JOIN players p ON m.sender_id = p.id
       WHERE m.room_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2`,
      [roomId, limit]
    );

    res.json({ messages: result.rows.reverse() });
  }

  async sendMessage(req, res) {
    const { room_id, content } = req.body;
    const { userId } = req.user;
    const messageId = uuidv4();

    // Get player ID
    const playerResult = await pool.query(
      'SELECT id FROM players WHERE user_id = $1',
      [userId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const playerId = playerResult.rows[0].id;

    const result = await pool.query(
      'INSERT INTO messages (id, room_id, sender_id, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [messageId, room_id, playerId, content]
    );

    res.status(201).json(result.rows[0]);
  }

  async deleteMessage(req, res) {
    const { messageId } = req.params;

    await pool.query(
      'DELETE FROM messages WHERE id = $1',
      [messageId]
    );

    res.json({ message: 'Message deleted' });
  }

  async mutePlayer(req, res) {
    const { roomId, playerId } = req.params;

    await pool.query(
      'INSERT INTO muted_players (room_id, player_id) VALUES ($1, $2)',
      [roomId, playerId]
    );

    res.json({ message: 'Player muted' });
  }
}

module.exports = new ChatController();
