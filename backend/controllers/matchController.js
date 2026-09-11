const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class MatchController {
  async getAllMatches(req, res) {
    const status = req.query.status;
    let query = 'SELECT * FROM matches';
    const params = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT 50';
    const result = await pool.query(query, params);

    res.json({ matches: result.rows });
  }

  async getMatchById(req, res) {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM matches WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json(result.rows[0]);
  }

  async getLiveMatch(req, res) {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT m.*, 
              p1.username as player1_username,
              p2.username as player2_username
       FROM matches m
       LEFT JOIN players p1 ON m.player1_id = p1.id
       LEFT JOIN players p2 ON m.player2_id = p2.id
       WHERE m.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json(result.rows[0]);
  }

  async startMatch(req, res) {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE matches SET status = $1, started_at = NOW() WHERE id = $2 RETURNING *',
      ['live', id]
    );

    res.json(result.rows[0]);
  }

  async submitScore(req, res) {
    const { id } = req.params;
    const { player1_score, player2_score, duration, notes } = req.body;

    const result = await pool.query(
      `UPDATE matches 
       SET player1_score = $1, player2_score = $2, duration = $3, notes = $4, status = 'pending_approval'
       WHERE id = $5
       RETURNING *`,
      [player1_score, player2_score, duration, notes, id]
    );

    res.json({ message: 'Score submitted for approval', match: result.rows[0] });
  }

  async approveResult(req, res) {
    const { id } = req.params;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const matchResult = await client.query(
        'SELECT * FROM matches WHERE id = $1',
        [id]
      );

      if (matchResult.rows.length === 0) {
        return res.status(404).json({ error: 'Match not found' });
      }

      const match = matchResult.rows[0];
      const winnerId = match.player1_score > match.player2_score ? match.player1_id : match.player2_id;
      const loserId = match.player1_score > match.player2_score ? match.player2_id : match.player1_id;

      // Update match
      await client.query(
        'UPDATE matches SET status = $1, winner_id = $2, loser_id = $3, approved_at = NOW() WHERE id = $4',
        ['completed', winnerId, loserId, id]
      );

      // Update player stats
      await client.query(
        'UPDATE players SET wins = wins + 1 WHERE id = $1',
        [winnerId]
      );
      await client.query(
        'UPDATE players SET losses = losses + 1 WHERE id = $1',
        [loserId]
      );

      await client.query('COMMIT');
      res.json({ message: 'Result approved and ratings updated' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async disputeResult(req, res) {
    const { id } = req.params;
    const { reason } = req.body;

    await pool.query(
      'UPDATE matches SET status = $1, dispute_reason = $2 WHERE id = $3',
      ['disputed', reason, id]
    );

    res.json({ message: 'Result disputed. Admin will review.' });
  }

  async getMatchReplay(req, res) {
    const { id } = req.params;
    // In production, retrieve from video storage service
    res.json({ message: 'Replay feature coming soon' });
  }
}

module.exports = new MatchController();
