const express = require('express');

const { Group } = require('../db/models');

const {
	jwtAuthMiddleware,
	ownershipAuthMiddleware,
	groupMemberAuth,
	adminAuth,
} = require('../middleware/auth');

const {
	createGroupHandler,
	getAllUserGroupsHandler,
	getGroupHandler,
	updateGroupHandler,
	deleteGroupHandler,
	getMembersHandler,
	getAllGroups,
	getGroupMessagesHandler,
} = require('../services/group.service');

const router = new express.Router();
//
//
//        ROUTES
router.post('/groups', jwtAuthMiddleware, createGroupHandler);

router.get('/groups/all', jwtAuthMiddleware, adminAuth, getAllGroups);

router.get('/groups/me', jwtAuthMiddleware, getAllUserGroupsHandler);

// router.get('/groups/me/leader', jwtAuthMiddleware, getLeaderGroupsHandler);

router.get(
	'/groups/:groupId',
	jwtAuthMiddleware,
	groupMemberAuth,
	getGroupHandler
);

router.get(
	'/groups/:groupId/members',
	jwtAuthMiddleware,
	groupMemberAuth,
	getMembersHandler
);

router.get(
	'/groups/:groupId/get-message-history',
	jwtAuthMiddleware,
	groupMemberAuth,
	getGroupMessagesHandler
);

router.patch(
	'/groups/:groupId',
	jwtAuthMiddleware,
	ownershipAuthMiddleware(
		Group,
		'params.groupId',
		'group',
		'adminIds',
		'user._id'
	),
	updateGroupHandler
);

router.delete(
	'/groups/:groupId',
	jwtAuthMiddleware,
	ownershipAuthMiddleware(
		Group,
		'params.groupId',
		'group',
		'adminIds',
		'user._id'
	),
	deleteGroupHandler
);
//
//
//
module.exports = router;
