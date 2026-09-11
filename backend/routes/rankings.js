const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const rankingController = require('../controllers/rankingController');

router.get('/', asyncHandler(rankingController.getGlobalRankings));
router.get('/seasonal', asyncHandler(rankingController.getSeasonalRankings));
router.get('/monthly', asyncHandler(rankingController.getMonthlyRankings));
router.get('/:id', asyncHandler(rankingController.getPlayerRanking));
router.get('/:id/history', asyncHandler(rankingController.getRankingHistory));

module.exports = router;
