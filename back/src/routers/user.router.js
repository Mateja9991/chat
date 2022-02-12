const express = require('express');

const { Group } = require('../db/models');

const {
	jwtAuthMiddleware,
	ownershipAuthMiddleware,
	groupMemberAuth,
} = require('../middleware/auth/index');
const {
	createUserHandler,
	loginUserHandler,
	logoutUserHandler,
	getProfileHandler,
	getUserHandler,
	getUserByEmailHandler,
	getAllUsersHandler,
	updateUserHandler,
	deleteUserHandler,
	sendGroupInvitationHandler,
	getGroupInvitationsHandler,
	acceptGroupInvitationHandler,
	declineGroupInvitationHandler,
	deleteAnyUserHandler,
	getUserMessagesHandler,
	getGroupMessagesHandler,
	getUserByUsernameHandler,
	setAvatarHandler,
	getAvatarHandler,
	sendResetTokenHandler,
	changePasswordHandler,
	leaveGroupHandler,
	getFriendsHandler,
	getFriendRequestsHandler,
	sendFriendRequestHandler,
	acceptFriendRequestHandler,
	declineFriendRequestHandler,
	getUserContactsHandler,
	removeUserFromFriendsHandler,
	removeUserFromGroupHandler,
} = require('../services/user.service');

const router = new express.Router();
//
//        ROUTES
//

router.post('/users', createUserHandler);

router.post('/users/login', loginUserHandler);

router.post('/users/logout', jwtAuthMiddleware, logoutUserHandler);

router.get('/users/all', jwtAuthMiddleware, getAllUsersHandler);

router.get('/users/me', jwtAuthMiddleware, getProfileHandler);

router.get('/users/me/contacts', jwtAuthMiddleware, getUserContactsHandler);

router.get('/users/me/avatar', jwtAuthMiddleware, getAvatarHandler);

router.get('/users/:userId', jwtAuthMiddleware, getUserHandler);

router.get('/users/me/friends', jwtAuthMiddleware, getFriendsHandler);

router.get(
	'/users/me/friend-requests',
	jwtAuthMiddleware,
	getFriendRequestsHandler
);

router.get(
	'/users/me/invitations',
	jwtAuthMiddleware,
	getGroupInvitationsHandler
);

router.get(
	'/users/:userId/messages',
	jwtAuthMiddleware,
	getUserMessagesHandler
);

router.get(
	'/users/me/groups/:groupId/messages',
	jwtAuthMiddleware,
	getGroupMessagesHandler
);

router.get('/users/email/:email', jwtAuthMiddleware, getUserByEmailHandler);

router.get(
	'/users/username/:username',
	jwtAuthMiddleware,
	getUserByUsernameHandler
);

router.patch('/users/me', jwtAuthMiddleware, updateUserHandler);

router.patch(
	'/users/send-friend-request/:userId',
	jwtAuthMiddleware,
	sendFriendRequestHandler
);

router.patch(
	'/users/send-friend-request',
	jwtAuthMiddleware,
	sendFriendRequestHandler
);
router.patch(
	'/users/accept-friend-request',
	jwtAuthMiddleware,
	acceptFriendRequestHandler
);
router.patch(
	'/users/decline-friend-request',
	jwtAuthMiddleware,
	declineFriendRequestHandler
);

router.patch(
	'/users/remove-friend',
	jwtAuthMiddleware,
	removeUserFromFriendsHandler
);

router.patch(
	'/users/send-group-invitation',
	jwtAuthMiddleware,
	ownershipAuthMiddleware(
		Group,
		'body.groupId',
		'group',
		'adminIds',
		'user._id'
	),
	sendGroupInvitationHandler
);

router.patch(
	'/users/me/accept-group-invitation',
	jwtAuthMiddleware,
	acceptGroupInvitationHandler
);

router.patch(
	'/users/me/decline-group-invitation',
	jwtAuthMiddleware,
	declineGroupInvitationHandler
);

router.patch(
	'/users/me/leave-group',
	jwtAuthMiddleware,
	groupMemberAuth,
	leaveGroupHandler
);

router.patch(
	'/users/remove-from-group',
	jwtAuthMiddleware,
	ownershipAuthMiddleware(
		Group,
		'body.groupId',
		'group',
		'adminIds',
		'user._id'
	),
	removeUserFromGroupHandler
);

router.patch(
	'/users/me/avatars/:avatarId',
	jwtAuthMiddleware,
	setAvatarHandler
);

router.patch('/users/:email/send-token', sendResetTokenHandler);

router.patch('/users/:email/change-password/:key', changePasswordHandler);

router.delete('/users/me', jwtAuthMiddleware, deleteUserHandler);

router.delete('/users/:userId', jwtAuthMiddleware, deleteAnyUserHandler);
//
//
//
module.exports = router;
