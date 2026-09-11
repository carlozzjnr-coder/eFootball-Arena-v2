const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const adminController = require('../controllers/adminController');

// Stats
router.get('/stats', authenticateAdmin, asyncHandler(adminController.getPlatformStats));
router.get('/stats/players', authenticateAdmin, asyncHandler(adminController.getPlayerStats));
router.get('/stats/tournaments', authenticateAdmin, asyncHandler(adminController.getTournamentStats));

// Players
router.get('/players', authenticateAdmin, asyncHandler(adminController.getAllPlayers));
router.post('/players/:id/verify', authenticateAdmin, asyncHandler(adminController.verifyPlayer));
router.post('/players/:id/ban', authenticateAdmin, asyncHandler(adminController.banPlayer));
router.post('/players/:id/unban', authenticateAdmin, asyncHandler(adminController.unbanPlayer));
router.delete('/players/:id', authenticateAdmin, asyncHandler(adminController.deletePlayer));

// Reports
router.get('/reports', authenticateAdmin, asyncHandler(adminController.getReports));
router.post('/reports/:id/resolve', authenticateAdmin, asyncHandler(adminController.resolveReport));
router.post('/reports/:id/dismiss', authenticateAdmin, asyncHandler(adminController.dismissReport));

// Tournaments
router.get('/tournaments', authenticateAdmin, asyncHandler(adminController.getTournaments));
router.post('/tournaments/:id/cancel', authenticateAdmin, asyncHandler(adminController.cancelTournament));

// Moderation
router.post('/moderate/message/:id', authenticateAdmin, asyncHandler(adminController.removeMessage));
router.post('/moderate/warning/:playerId', authenticateAdmin, asyncHandler(adminController.issueWarning));

module.exports = router;
