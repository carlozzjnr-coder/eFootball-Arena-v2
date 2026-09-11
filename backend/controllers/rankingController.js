const pool = require('../config/database');

class RankingController {
  async getGlobalRankings(req, res) {
    const limit = req.query.limit || 50;
    const offset = (req.query.page - 1) * limit || 0;

    const result = await pool.query(
      `SELECT 
        p.id,
        p.username,
        p.avatar,
        COUNT(CASE WHEN m.winner_id = p.id THEN 1 END) as wins,
        COUNT(CASE WHEN m.loser_id = p.id THEN 1 END) as losses,
        ROUND(100.0 * COUNT(CASE WHEN m.winner_id = p.id THEN 1 END) / NULLIF(COUNT(m.id), 0), 2) as win_rate,
        p.fair_play_score,
        ROW_NUMBER() OVER (ORDER BY COUNT(CASE WHEN m.winner_id = p.id THEN 1 END) DESC) as rank
      FROM players p
      LEFT JOIN matches m ON (m.winner_id = p.id OR m.loser_id = p.id) AND m.status = 'completed'
      GROUP BY p.id, p.username, p.avatar, p.fair_play_score
      ORDER BY wins DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({ rankings: result.rows });
  }

  async getSeasonalRankings(req, res) {
    const season = req.query.season || 'current';
    const limit = req.query.limit || 50;

    const result = await pool.query(
      `SELECT 
        p.id,
        p.username,
        COUNT(CASE WHEN m.winner_id = p.id THEN 1 END) as seasonal_wins,
        p.fair_play_score
      FROM players p
      LEFT JOIN matches m ON (m.winner_id = p.id OR m.loser_id = p.id) 
        AND m.status = 'completed'
        AND DATE_TRUNC('quarter', m.approved_at) = DATE_TRUNC('quarter', NOW())
      GROUP BY p.id
      ORDER BY seasonal_wins DESC
      LIMIT $1`,
      [limit]
    );

    res.json({ seasonal_rankings: result.rows });
  }

  async getMonthlyRankings(req, res) {
    const limit = req.query.limit || 50;

    const result = await pool.query(
      `SELECT 
        p.id,
        p.username,
        COUNT(CASE WHEN m.winner_id = p.id THEN 1 END) as monthly_wins
      FROM players p
      LEFT JOIN matches m ON (m.winner_id = p.id OR m.loser_id = p.id)
        AND m.status = 'completed'
        AND DATE_TRUNC('month', m.approved_at) = DATE_TRUNC('month', NOW())
      GROUP BY p.id
      ORDER BY monthly_wins DESC
      LIMIT $1`,
      [limit]
    );

    res.json({ monthly_rankings: result.rows });
  }

  async getPlayerRanking(req, res) {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        p.id,
        p.username,
        p.avatar,
        COUNT(CASE WHEN m.winner_id = p.id THEN 1 END) as wins,
        COUNT(CASE WHEN m.loser_id = p.id THEN 1 END) as losses,
        ROUND(100.0 * COUNT(CASE WHEN m.winner_id = p.id THEN 1 END) / NULLIF(COUNT(m.id), 0), 2) as win_rate,
        p.fair_play_score,
        (SELECT COUNT(*) FROM players p2 
         WHERE (SELECT COUNT(*) FROM matches m2 WHERE m2.winner_id = p2.id AND m2.status = 'completed')
         > (SELECT COUNT(*) FROM matches m3 WHERE m3.winner_id = p.id AND m3.status = 'completed')) + 1 as rank
      FROM players p
      LEFT JOIN matches m ON (m.winner_id = p.id OR m.loser_id = p.id) AND m.status = 'completed'
      WHERE p.id = $1
      GROUP BY p.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(result.rows[0]);
  }

  async getRankingHistory(req, res) {
    const { id } = req.params;
    const months = req.query.months || 6;

    const result = await pool.query(
      `SELECT 
        DATE_TRUNC('month', m.approved_at)::DATE as month,
        COUNT(CASE WHEN m.winner_id = $1 THEN 1 END) as wins
      FROM matches m
      WHERE (m.winner_id = $1 OR m.loser_id = $1) 
        AND m.status = 'completed'
        AND m.approved_at > NOW() - INTERVAL '1 month' * $2
      GROUP BY DATE_TRUNC('month', m.approved_at)
      ORDER BY month DESC`,
      [id, months]
    );

    res.json({ history: result.rows });
  }
}

module.exports = new RankingController();
