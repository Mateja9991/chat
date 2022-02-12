const express = require('express');
const router = new express.Router();
const {
	jwtAuthMiddleware,
	groupMemberAuth,
	sessionAuth,
	// sessionAuth,
} = require('../middleware/auth');
const {
	createPrivateSessionHandler,
	getUsersPrivateSessions,
	groupSessionHandler,
	getContentFromSession,
	getMessagesHandler,
	getOnePrivateSession,
	searchMessageHistoryHandler,
} = require('../services/session.service');

router.post(
	'/sessions/private/:userId',
	jwtAuthMiddleware,
	createPrivateSessionHandler
);
router.get(
	'/sessions/:sessionId/content/:contentType',
	jwtAuthMiddleware,
	sessionAuth,
	getContentFromSession
);
router.get(
	'/sessions/:sessionId/search',
	jwtAuthMiddleware,
	sessionAuth,
	searchMessageHistoryHandler
);
router.get(
	'/sessions/me/private-sessions',
	jwtAuthMiddleware,
	getUsersPrivateSessions
);
router.get(
	'/sessions/me/users/:userId',
	jwtAuthMiddleware,
	getOnePrivateSession
);
router.get(
	'/sessions/groups/:groupId',
	jwtAuthMiddleware,
	groupMemberAuth,
	groupSessionHandler
);
router.get(
	'/sessions/messages/:sessionId',
	jwtAuthMiddleware,
	getMessagesHandler
);
// router.delete('/sessions/sessionId',);
module.exports = router;
