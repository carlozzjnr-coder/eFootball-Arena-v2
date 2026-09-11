const express = require('express');
const router = express.Router();
const { authenticate, authenticateAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const playerController = require('../controllers/playerController');
const Joi = require('joi');

const updateProfileSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30),
  konami_id: Joi.string(),
  bio: Joi.string().max(500),
  avatar: Joi.string()
});

router.get('/', asyncHandler(playerController.getAllPlayers));
router.get('/:id', asyncHandler(playerController.getPlayerById));
router.get('/:id/stats', asyncHandler(playerController.getPlayerStats));
router.get('/search/:username', asyncHandler(playerController.searchPlayer));
router.post('/', authenticate, validate(updateProfileSchema), asyncHandler(playerController.createProfile));
router.put('/:id', authenticate, validate(updateProfileSchema), asyncHandler(playerController.updateProfile));
router.post('/:id/verify-konami', authenticate, asyncHandler(playerController.verifyKonamiId));
router.get('/:id/history', asyncHandler(playerController.getMatchHistory));

module.exports = router;
