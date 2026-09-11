const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class PlayerController {
  async getAllPlayers(req, res) {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT p.*, 
              (SELECT COUNT(*) FROM matches WHERE winner_id = p.id) as wins,
              (SELECT COUNT(*) FROM matches WHERE loser_id = p.id) as losses
       FROM players p
       ORDER BY wins DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      players: result.rows,
      page,
      limit,
      total: result.rows.length
    });
  }

  async getPlayerById(req, res) {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM players WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(result.rows[0]);
  }

  async getPlayerStats(req, res) {
    const { id } = req.params;
    const stats = await pool.query(
      `SELECT 
        p.id,
        p.username,
        COUNT(CASE WHEN m.winner_id = p.id THEN 1 END) as total_wins,
        COUNT(CASE WHEN m.loser_id = p.id THEN 1 END) as total_losses,
        COUNT(m.id) as total_matches,
        ROUND(100.0 * COUNT(CASE WHEN m.winner_id = p.id THEN 1 END) / NULLIF(COUNT(m.id), 0), 2) as win_rate,
        p.fair_play_score,
        p.created_at
      FROM players p
      LEFT JOIN matches m ON (m.winner_id = p.id OR m.loser_id = p.id)
      WHERE p.id = $1
      GROUP BY p.id, p.username, p.fair_play_score, p.created_at`,
      [id]
    );

    if (stats.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(stats.rows[0]);
  }

  async searchPlayer(req, res) {
    const { username } = req.params;
    const result = await pool.query(
      'SELECT * FROM players WHERE username ILIKE $1 LIMIT 10',
      [`%${username}%`]
    );

    res.json({ results: result.rows });
  }

  async createProfile(req, res) {
    const { username, konami_id, bio, avatar } = req.body;
    const { userId } = req.user;
    const playerId = uuidv4();

    try {
      const result = await pool.query(
        `INSERT INTO players (id, user_id, username, konami_id, bio, avatar) 
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [playerId, userId, username, konami_id, bio, avatar]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (err.code === '23505') {
        return res.status(400).json({ error: 'Username already taken' });
      }
      throw err;
    }
  }

  async updateProfile(req, res) {
    const { id } = req.params;
    const { username, konami_id, bio, avatar } = req.body;

    const result = await pool.query(
      `UPDATE players 
       SET username = COALESCE($1, username),
           konami_id = COALESCE($2, konami_id),
           bio = COALESCE($3, bio),
           avatar = COALESCE($4, avatar),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [username, konami_id, bio, avatar, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(result.rows[0]);
  }

  async verifyKonamiId(req, res) {
    const { id } = req.params;
    const { konami_id } = req.body;

    // Mock Konami verification - In production, integrate with Konami API
    const result = await pool.query(
      'UPDATE players SET is_verified = true WHERE id = $1 RETURNING *',
      [id]
    );

    res.json({ message: 'Konami ID verified', player: result.rows[0] });
  }

  async getMatchHistory(req, res) {
    const { id } = req.params;
    const limit = req.query.limit || 20;

    const result = await pool.query(
      `SELECT * FROM matches 
       WHERE winner_id = $1 OR loser_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [id, limit]
    );

    res.json({ matches: result.rows });
  }
}

module.module = new PlayerController();
