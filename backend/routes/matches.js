const express = require('express');
const router = express.Router();
const { authenticate, authenticateAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const matchController = require('../controllers/matchController');
const Joi = require('joi');

const submitScoreSchema = Joi.object({
  player1_score: Joi.number().min(0).required(),
  player2_score: Joi.number().min(0).required(),
  duration: Joi.number(),
  notes: Joi.string()
});

router.get('/', asyncHandler(matchController.getAllMatches));
router.get('/:id', asyncHandler(matchController.getMatchById));
router.get('/:id/live', asyncHandler(matchController.getLiveMatch));
router.post('/:id/start', authenticate, asyncHandler(matchController.startMatch));
router.post('/:id/score', authenticate, validate(submitScoreSchema), asyncHandler(matchController.submitScore));
router.post('/:id/approve', authenticateAdmin, asyncHandler(matchController.approveResult));
router.post('/:id/dispute', authenticate, asyncHandler(matchController.disputeResult));
router.get('/:id/replay', asyncHandler(matchController.getMatchReplay));

module.exports = router;
