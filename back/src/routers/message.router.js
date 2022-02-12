const express = require('express');
const router = new express.Router();
const {
	jwtAuthMiddleware,
	messageToUserAuth,
	// sessionAuth,
} = require('../middleware/auth');
const { deleteMessageHandler } = require('../services/message.service');

router.patch(
	'/messages/:messageId',
	jwtAuthMiddleware,
	messageToUserAuth,
	deleteMessageHandler
);

// router.delete('/sessions/sessionId',);
module.exports = router;
