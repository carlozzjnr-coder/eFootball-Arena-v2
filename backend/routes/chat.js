const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const chatController = require('../controllers/chatController');
const Joi = require('joi');

const messageSchema = Joi.object({
  room_id: Joi.string().required(),
  content: Joi.string().max(1000).required()
});

router.get('/rooms/:roomId', asyncHandler(chatController.getRoomMessages));
router.post('/send', authenticate, validate(messageSchema), asyncHandler(chatController.sendMessage));
router.delete('/:messageId', authenticate, asyncHandler(chatController.deleteMessage));
router.post('/rooms/:roomId/mute/:playerId', authenticate, asyncHandler(chatController.mutePlayer));

module.exports = router;
