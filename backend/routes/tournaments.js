const express = require('express');
const router = express.Router();
const { authenticate, authenticateAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const tournamentController = require('../controllers/tournamentController');
const Joi = require('joi');

const createTournamentSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string(),
  start_date: Joi.date().required(),
  end_date: Joi.date().min(Joi.ref('start_date')).required(),
  max_players: Joi.number().min(4).max(256).required(),
  format: Joi.string().valid('knockout', 'group_stage', 'swiss').default('knockout'),
  prize_pool: Joi.number().default(0)
});

router.get('/', asyncHandler(tournamentController.getAllTournaments));
router.get('/:id', asyncHandler(tournamentController.getTournamentById));
router.get('/:id/bracket', asyncHandler(tournamentController.getTournamentBracket));
router.get('/:id/participants', asyncHandler(tournamentController.getTournamentParticipants));
router.post('/', authenticateAdmin, validate(createTournamentSchema), asyncHandler(tournamentController.createTournament));
router.put('/:id', authenticateAdmin, asyncHandler(tournamentController.updateTournament));
router.post('/:id/join', authenticate, asyncHandler(tournamentController.joinTournament));
router.post('/:id/leave', authenticate, asyncHandler(tournamentController.leaveTournament));
router.post('/:id/start', authenticateAdmin, asyncHandler(tournamentController.startTournament));
router.post('/:id/generate-matches', authenticateAdmin, asyncHandler(tournamentController.generateMatches));

module.exports = router;
