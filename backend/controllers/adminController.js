const pool = require('../config/database');

class AdminController {
  async getPlatformStats(req, res) {
    const stats = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM players) as total_players,
        (SELECT COUNT(*) FROM tournaments) as total_tournaments,
        (SELECT COUNT(*) FROM matches) as total_matches,
        (SELECT COUNT(*) FROM players WHERE is_verified = true) as verified_players,
        (SELECT COUNT(*) FROM player_reports) as open_reports`
    );

    res.json(stats.rows[0]);
  }

  async getPlayerStats(req, res) {
    const result = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_players
      FROM players
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC`
    );

    res.json({ stats: result.rows });
  }

  async getTournamentStats(req, res) {
    const result = await pool.query(
      `SELECT 
        status,
        COUNT(*) as count,
        AVG(CAST((SELECT COUNT(*) FROM tournament_players tp WHERE tp.tournament_id = t.id) AS FLOAT)) as avg_participants
      FROM tournaments t
      GROUP BY status`
    );

    res.json({ stats: result.rows });
  }

  async getAllPlayers(req, res) {
    const page = req.query.page || 1;
    const limit = req.query.limit || 50;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT p.*, u.email, u.created_at as registered_at
       FROM players p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({ players: result.rows, page, limit });
  }

  async verifyPlayer(req, res) {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE players SET is_verified = true WHERE id = $1 RETURNING *',
      [id]
    );

    res.json({ message: 'Player verified', player: result.rows[0] });
  }

  async banPlayer(req, res) {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await pool.query(
      'UPDATE players SET is_banned = true, ban_reason = $1 WHERE id = $2 RETURNING *',
      [reason, id]
    );

    res.json({ message: 'Player banned', player: result.rows[0] });
  }

  async unbanPlayer(req, res) {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE players SET is_banned = false, ban_reason = NULL WHERE id = $1 RETURNING *',
      [id]
    );

    res.json({ message: 'Player unbanned', player: result.rows[0] });
  }

  async deletePlayer(req, res) {
    const { id } = req.params;

    await pool.query('DELETE FROM players WHERE id = $1', [id]);

    res.json({ message: 'Player deleted' });
  }

  async getReports(req, res) {
    const result = await pool.query(
      `SELECT pr.*, p.username, a.username as admin_username
       FROM player_reports pr
       JOIN players p ON pr.reported_player_id = p.id
       LEFT JOIN users a ON pr.resolved_by = a.id
       ORDER BY pr.created_at DESC`
    );

    res.json({ reports: result.rows });
  }

  async resolveReport(req, res) {
    const { id } = req.params;
    const { resolution } = req.body;
    const { userId } = req.user;

    const result = await pool.query(
      'UPDATE player_reports SET status = $1, resolution = $2, resolved_by = $3 WHERE id = $4 RETURNING *',
      ['resolved', resolution, userId, id]
    );

    res.json({ message: 'Report resolved', report: result.rows[0] });
  }

  async dismissReport(req, res) {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE player_reports SET status = $1 WHERE id = $2 RETURNING *',
      ['dismissed', id]
    );

    res.json({ message: 'Report dismissed', report: result.rows[0] });
  }

  async getTournaments(req, res) {
    const result = await pool.query('SELECT * FROM tournaments ORDER BY created_at DESC');
    res.json({ tournaments: result.rows });
  }

  async cancelTournament(req, res) {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE tournaments SET status = $1 WHERE id = $2 RETURNING *',
      ['cancelled', id]
    );

    res.json({ message: 'Tournament cancelled', tournament: result.rows[0] });
  }

  async removeMessage(req, res) {
    const { id } = req.params;

    await pool.query('DELETE FROM messages WHERE id = $1', [id]);

    res.json({ message: 'Message removed' });
  }

  async issueWarning(req, res) {
    const { playerId } = req.params;
    const { reason } = req.body;

    await pool.query(
      'UPDATE players SET warnings = warnings + 1 WHERE id = $1',
      [playerId]
    );

    res.json({ message: 'Warning issued' });
  }
}

module.exports = new AdminController();
