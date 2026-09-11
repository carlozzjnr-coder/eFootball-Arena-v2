const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class TournamentController {
  async getAllTournaments(req, res) {
    const status = req.query.status;
    let query = 'SELECT * FROM tournaments';
    const params = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY start_date DESC';
    const result = await pool.query(query, params);

    res.json({ tournaments: result.rows });
  }

  async getTournamentById(req, res) {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM tournaments WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json(result.rows[0]);
  }

  async getTournamentBracket(req, res) {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM matches WHERE tournament_id = $1 ORDER BY round ASC',
      [id]
    );

    res.json({ bracket: result.rows });
  }

  async getTournamentParticipants(req, res) {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.* FROM players p
       INNER JOIN tournament_players tp ON p.id = tp.player_id
       WHERE tp.tournament_id = $1
       ORDER BY p.username ASC`,
      [id]
    );

    res.json({ participants: result.rows });
  }

  async createTournament(req, res) {
    const { name, description, start_date, end_date, max_players, format, prize_pool } = req.body;
    const { userId } = req.user;
    const tournamentId = uuidv4();

    const result = await pool.query(
      `INSERT INTO tournaments (id, name, description, start_date, end_date, max_players, format, prize_pool, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'upcoming')
       RETURNING *`,
      [tournamentId, name, description, start_date, end_date, max_players, format, prize_pool, userId]
    );

    res.status(201).json(result.rows[0]);
  }

  async updateTournament(req, res) {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const result = await pool.query(
      `UPDATE tournaments
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, description, status, id]
    );

    res.json(result.rows[0]);
  }

  async joinTournament(req, res) {
    const { id } = req.params;
    const { userId } = req.user;

    // Get player ID
    const playerResult = await pool.query(
      'SELECT id FROM players WHERE user_id = $1',
      [userId]
    );
    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Player profile not found' });
    }
    const playerId = playerResult.rows[0].id;

    // Check tournament capacity
    const tournamentResult = await pool.query(
      `SELECT COUNT(*) as count FROM tournament_players WHERE tournament_id = $1`,
      [id]
    );
    const tournament = await pool.query('SELECT max_players FROM tournaments WHERE id = $1', [id]);

    if (parseInt(tournamentResult.rows[0].count) >= tournament.rows[0].max_players) {
      return res.status(400).json({ error: 'Tournament is full' });
    }

    // Add player to tournament
    await pool.query(
      'INSERT INTO tournament_players (tournament_id, player_id) VALUES ($1, $2)',
      [id, playerId]
    );

    res.json({ message: 'Successfully joined tournament' });
  }

  async leaveTournament(req, res) {
    const { id } = req.params;
    const { userId } = req.user;

    const playerResult = await pool.query(
      'SELECT id FROM players WHERE user_id = $1',
      [userId]
    );
    const playerId = playerResult.rows[0].id;

    await pool.query(
      'DELETE FROM tournament_players WHERE tournament_id = $1 AND player_id = $2',
      [id, playerId]
    );

    res.json({ message: 'Successfully left tournament' });
  }

  async startTournament(req, res) {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE tournaments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['ongoing', id]
    );

    res.json(result.rows[0]);
  }

  async generateMatches(req, res) {
    const { id } = req.params;

    // Get all tournament players
    const playersResult = await pool.query(
      `SELECT p.id FROM players p
       INNER JOIN tournament_players tp ON p.id = tp.player_id
       WHERE tp.tournament_id = $1
       ORDER BY RANDOM()`,
      [id]
    );

    const players = playersResult.rows.map(p => p.id);

    // Generate knockout matches
    for (let i = 0; i < players.length; i += 2) {
      if (i + 1 < players.length) {
        const matchId = uuidv4();
        await pool.query(
          `INSERT INTO matches (id, tournament_id, player1_id, player2_id, round, status)
           VALUES ($1, $2, $3, $4, 1, 'scheduled')`,
          [matchId, id, players[i], players[i + 1]]
        );
      }
    }

    res.json({ message: 'Matches generated successfully' });
  }
}

module.exports = new TournamentController();
