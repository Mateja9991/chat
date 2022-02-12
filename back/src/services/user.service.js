const bcrypt = require('bcryptjs');

const Socket = require('../socket/socket');
const { SOCKET_EVENTS } = require('../constants/socket_events');
const { User, Avatar, Group, Session, Message } = require('../db/models');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const timeValues = require('../constants/time_values');
const { deleteSingleGroupHandler } = require('./group.service');

const {
	// sendResetTokenMail,
	optionsBuilder,
	matchBuilder,
	queryHandler,
	// scheduleJobHandler,
	destructureObject,
	// newNotification,
	checkAndUpdate,
} = require('./utils');

const {
	getSessionMessagesHandler,
	getSessionHandler,
	getGroupSessionHandler,
	addParticipantHandler,
	getPrivateSessionHandler,
	newSessionHandler,
} = require('./session.service');

const { MODEL_PROPERTIES } = require('../constants');
const { jwtAuthMiddleware } = require('../middleware/auth');

const selectFields = MODEL_PROPERTIES.USER.SELECT_FIELDS;
const allowedKeys = MODEL_PROPERTIES.USER.ALLOWED_KEYS;

//
//        ROUTER HANDLERS
//
const mapUsers = (users) =>
	users.map(({ username, active, email, avatar, _id: id }) => ({
		username,
		active,
		email,
		avatar,
		id,
	}));
async function createUserHandler(req, res, next) {
	{
		try {
			const userObject = destructureObject(req.body, allowedKeys.CREATE);
			const user = new User({
				...userObject,
			});
			console.log(user);
			await user.save();
			const token = await user.generateAuthToken();
			res.send({ user, token });
		} catch (e) {
			next(e);
		}
	}
}

async function loginUserHandler(req, res, next) {
	try {
		const user = await User.findByCredentials(req.body.id, req.body.password);
		// const notificationNumber = user.notifications.reduce(
		// 	(acc, notif) => acc + (notif.seen ? 0 : 1),
		// 	0
		// );
		if (!user.active) {
			user.active = true;
			await user.save();
		}
		const token = await user.generateAuthToken();
		await user.populate('avatar', '_id picture').execPopulate();

		res.send({ user, token });
	} catch (e) {
		next(e);
	}
}

async function setAvatarHandler(req, res, next) {
	try {
		const avatar = await Avatar.findById(req.params.avatarId);
		if (!avatar) {
			res.status(404);
			throw new Error('Avatar not found.');
		}
		req.user.avatar = req.params.avatarId;
		await req.user.save();
		// req.user.avatar.picture = await req.user.generateBase64();
		res.send(avatar);
	} catch (e) {
		next(e);
	}
}

async function logoutUserHandler(req, res, next) {
	try {
		await req.user.save();
		res.send();
	} catch (e) {
		next(e);
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////									GET ROUTES								////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function getProfileHandler(req, res, next) {
	try {
		console.log(req.user);
		await req.user.populate('groups').execPopulate();
		await req.user.populate('avatar', '_id picture').execPopulate();
		// if (req.user.avatar) {
		// 	req.user.avatar.picture = await req.user.generateBase64();
		// }
		res.send(req.user);
	} catch (err) {
		next(err);
	}
}

async function getAvatarHandler(req, res, next) {
	try {
		if (!req.user.avatar) {
			res.status(404);
			throw new Error('User has no avatar.');
		}
		await req.user.populate('avatar', '_id picture').execPopulate();

		res.send(req.user.avatar);
	} catch (e) {
		next(e);
	}
}

async function getUserHandler(req, res, next) {
	try {
		const user = await User.findById(req.params.userId);
		if (!user) {
			return res.status(404).send();
		}
		await user.populate('avatar', '_id picture').execPopulate();
		res.send(user);
	} catch (e) {
		next(e);
	}
}

async function getFriendsHandler(req, res, next) {
	try {
		const { user, query } = req;
		const options = optionsBuilder(
			query.limit,
			query.skip,
			query.sortBy,
			query.sortValue
		);
		const match = matchBuilder(query);
		await user
			.populate({
				path: 'friends',
				match,
				options,
				populate: {
					path: 'avatar',
					select: '_id picture',
				},
			})
			.execPopulate();
		console.log(user);
		console.log('friends');
		res.send(mapUsers(user.friends));
	} catch (e) {
		next(e);
	}
}

async function getFriendRequestsHandler(req, res, next) {
	try {
		const { user } = req;
		await user
			.populate({
				path: 'friendRequests',
				// match,
				// options,
				populate: {
					path: 'avatar',
					select: '_id picture',
				},
			})
			.execPopulate();
		res.send(mapUsers(user.friendRequests));
	} catch (e) {
		next(e);
	}
}

async function sendFriendRequestHandler(req, res, next) {
	try {
		const {
			body: { userId },
			user: { id },
		} = req;
		const newFriend = await User.findById(userId);
		console.log(newFriend);
		if (!newFriend) {
			return res.status(404).send();
		}
		if (newFriend.friendRequests.includes(id)) return res.status(402).send();
		newFriend.friendRequests.push(id);
		await newFriend.save();
		res.send(newFriend);
	} catch (e) {
		next(e);
	}
}
async function declineFriendRequestHandler(req, res, next) {
	try {
		const {
			body: { userId },
			user,
		} = req;
		user.friendRequests = user.friendRequests.filter(
			(friend) => !friend.equals(ObjectId(userId))
		);
		await user.save();
		await user.populate('friendRequests').execPopulate();

		for (let i = 0; i < user.friendRequests.length; ++i) {
			await user.populate(`friendRequests.${i}.avatar`).execPopulate();
		}
		res.send(user.friendRequests);
	} catch (e) {
		next(e);
	}
}
async function acceptFriendRequestHandler(req, res, next) {
	try {
		const {
			body: { userId },
			user,
		} = req;
		console.log(user.friends);
		console.log('friends logged');
		user.friends = user.friends.filter(
			(friend) => !friend.equals(ObjectId(userId))
		);
		if (!user.friendRequests.includes(ObjectId(userId)))
			return res.status(402).send();
		console.log(user);
		user.friendRequests = user.friendRequests.filter(
			(friendId) => !friendId.equals(ObjectId(userId))
		);
		user.friends.push(userId);
		await user.save();
		const newFriend = await User.findById(userId);
		newFriend.friends.push(user.id);
		const session = await getSessionHandler([user._id, newFriend._id], null);
		await newFriend.save();
		console.log(user);
		await user.populate('friendRequests').execPopulate();

		for (let i = 0; i < user.friendRequests.length; ++i) {
			await user.populate(`friendRequests.${i}.avatar`).execPopulate();
		}
		res.send(user.friendRequests);
	} catch (e) {
		next(e);
	}
}

async function removeUserFromFriendsHandler(req, res, next) {
	try {
		const {
			body: { userId },
			user,
		} = req;
		user.friends = user.friends.filter(
			(friend) => !friend.equals(ObjectId(userId))
		);
		await user.save();
		const friend = await User.findById(userId);
		friend.friends = friend.friends.filter(
			(friend) => !friend.equals(ObjectId(user.id))
		);
		await friend.save();
		await user
			.populate({
				path: 'friends',
				select: 'id username avatar email',
				populate: { path: 'avatar', select: '_id picture' },
			})
			.execPopulate();

		console.log(user.friends);
		res.send(user.friends);
	} catch (e) {
		next(e);
	}
}

async function removeUserFromGroupHandler(req, res, next) {
	try {
		const {
			body: { userId },
			group,
		} = req;
		const user = await User.findById(userId);
		if (!user.groups.includes(ObjectId(group._id))) {
			throw new Error('User not in group.');
		}
		user.groups = user.groups.filter(
			(groupId) => !groupId.equals(ObjectId(group._id))
		);
		await user.save();
		const session = await Session.findOne({ groupId: group._id });
		session.participants = session.participants.filter(
			({ userId: pUserId }) => !pUserId.equals(userId)
		);
		await session.save();
		group
			.populate({
				path: 'members',
				populate: { path: 'avatar', select: '_id picture' },
			})
			.execPopulate();
		res.send(group.members);
	} catch (e) {
		next(e);
	}
}

async function getGroupInvitationsHandler(req, res, next) {
	try {
		const options = optionsBuilder(
			req.query.limit,
			req.query.skip,
			req.query.sortBy,
			req.query.sortValue
		);
		const match = matchBuilder(req.query);
		await req.user
			.populate({
				path: 'invitations',
				match,
				options,
			})
			.execPopulate();
		console.log(req.user.invitations);
		for (let i = 0; i < req.user.invitations.length; ++i) {
			await req.user.populate(`invitations.${i}.groupId`).execPopulate();
			await req.user
				.populate(`invitations.${i}.groupId.adminIds`)
				.execPopulate();
		}
		const invitations = req.user.invitations.map((invitation) => ({
			id: invitation.groupId._id,
			name: invitation.groupId.name,
			createdAt: invitation.groupId.createdAt,
			groupAdmin: invitation.groupId.adminIds[0].username,
			receivedAt: invitation.receivedAt,
		}));
		res.send(invitations);
	} catch (e) {
		next(e);
	}
}

async function getUserMessagesHandler(req, res, next) {
	try {
		const contact = await User.findById(req.params.userId);
		const options = optionsBuilder(
			req.query.limit,
			req.query.skip,
			'createdAt',
			-1
		);
		await req.user.populate('avatar', '_id picture').execPopulate();
		await contact.populate('avatar', '_id picture').execPopulate();
		const allMessages = await getSessionMessagesHandler(
			options,
			[req.user._id, contact._id],
			null,
			req.user._id
		);
		let session;
		if (allMessages.length > 0)
			session = await Session.findById(allMessages[0].sessionId);
		console.log(session);
		for (const msg of allMessages) {
			console.log('seenBY IS ');
			console.log(msg.seenBy);
			if (!msg.seenBy.some((userId) => userId.equals(req.user._id))) {
				msg.seenBy.push(req.user._id);
				session.participants.forEach(({ userId }) =>
					Socket.sendEventToRoom(userId, SOCKET_EVENTS.USER_SEEN_MESSAGE, {
						sessionId: session._id,
						userId: req.user._id,
						username: req.user.username,
						messageId: msg.id,
					})
				);
			}
			await msg.save();
		}
		if (session)
			for (const participant of session.participants) {
				if (participant.userId.equals(req.user._id)) {
					participant.newMessages = 0;
					await session.save();
					break;
				}
			}
		const messages = await Promise.all(
			allMessages.map(async (msg) => {
				await msg
					.populate([
						{
							path: 'seenBy',
							select: 'username _id id',
							options: { lean: true },
						},
						{
							path: 'from',
							select: '_id id username avatar',
							populate: {
								path: 'avatar',
								select: '_id small',
								options: { lean: true },
							},
						},
					])
					.execPopulate();
				return msg;
			})
		);
		console.log(messages);
		res.send(messages.reverse());
	} catch (e) {
		next(e);
	}
}

async function getGroupMessagesHandler(req, res, next) {
	try {
		const options = optionsBuilder(
			req.query.limit,
			req.query.skip,
			'createdAt',
			-1
		);
		const allMessages = await getSessionMessagesHandler(
			options,
			undefined,
			req.params.groupId,
			req.user._id
		);
		// for (const msg of messages) {
		// 	await msg.populate('from', 'username _id avatar').execPopulate();
		// 	await msg.from.populate('avatar').execPopulate();
		// }
		let session;
		if (allMessages.length > 0)
			session = await Session.findById(allMessages[0].sessionId);
		for (const msg of allMessages) {
			console.log('seenBY IS ');
			console.log(msg.seenBy);
			if (!msg.seenBy.some((userId) => userId.equals(req.user._id))) {
				msg.seenBy.push(req.user._id);
				session.participants.forEach(({ userId }) =>
					Socket.sendEventToRoom(userId, SOCKET_EVENTS.USER_SEEN_MESSAGE, {
						sessionId: session._id,
						userId: req.user._id,
						username: req.user.username,
						messageId: msg.id,
					})
				);
			}
			await msg.save();
		}
		const messages = await Promise.all(
			allMessages.map(async (msg) => {
				await msg
					.populate({
						path: 'seenBy',
						select: 'username _id id',
						options: { lean: true },
					})
					.execPopulate();
				return msg;
			})
		);
		res.send(messages);
	} catch (e) {
		next(e);
	}
}

async function getUserByEmailHandler(req, res, next) {
	try {
		const user = await getSingleUserHandler({ email: req.params.email });
		res.send({ user });
	} catch (e) {
		res.status(400).send({ error: e.message });
	}
}

async function getUserByUsernameHandler(req, res, next) {
	try {
		const user = await getSingleUserHandler({ username: req.params.username });
		res.send({ user });
	} catch (e) {
		next(e);
	}
}

async function getSingleUserHandler(queryObject) {
	const user = await User.findOne(queryObject);
	if (!user) {
		res.status(404);
		throw new Error('User not found.');
	}
	return user;
}

//
//
//

async function updateUserHandler(req, res, next) {
	try {
		const updates = Object.keys(req.body);
		if (updates.includes('password')) {
			if (updates.includes('oldPassword')) {
				await req.user.checkPassword(req.body.oldPassword);
				console.log(123);
				updates.splice(
					updates.findIndex((update) => update === 'oldPassword'),
					1
				);
			} else {
				throw new Error('Old Password Not Found.');
			}
		}
		const newUser = {
			...(
				await checkAndUpdate(
					'USER',
					req.user,
					updates.reduce((acc, field) => {
						acc[field] = req.body[field];
						return acc;
					}, {}),
					res
				)
			).toJSON(),
		};
		delete newUser.avatar;
		console.log(newUser);
		res.send(newUser);
	} catch (e) {
		next(e);
	}
}

async function sendGroupInvitationHandler(req, res, next) {
	try {
		const {
			body: { userId },
			group,
		} = req;
		const user = await User.findOne({ _id: userId });
		if (!user) {
			res.status(404);
			throw new Error('User not found.');
		}
		if (
			user.invitations
				.map((invitation) => invitation.groupId)
				.includes(group._id) ||
			user.groups.includes(group._id)
		) {
			res.status(400);
			throw new Error('Already invited or joined.');
		}

		user.invitations.push({ groupId: group._id, receivedAt: Date.now() });
		await user.save();

		res.send({ success: true });
	} catch (e) {
		next(e);
	}
}

async function acceptGroupInvitationHandler(req, res, next) {
	try {
		const {
			user,
			body: { groupId },
		} = req;
		if (!user.invitations.filter((inv) => inv.groupId.equals(groupId)).length) {
			res.status(400);
			throw new Error('You have not been invited.');
		}
		user.invitations = user.invitations.filter((invitation) => {
			if (invitation.groupId.equals(groupId)) {
				user.groups.push(groupId);
				return false;
			}
			return true;
		});
		const group = await Group.findById(groupId);
		await addParticipantHandler(group._id, user._id);
		await user.save();
		await group.populate('adminIds').execPopulate();
		for (let i = 0; i < user.invitations.length; ++i) {
			await user.populate(`invitations.${i}.groupId`).execPopulate();
			await user.populate(`invitations.${i}.groupId.adminIds`).execPopulate();
		}
		const invitations = user.invitations.map((invitation) => ({
			id: invitation.groupId._id,
			name: invitation.groupId.name,
			createdAt: invitation.groupId.createdAt,
			groupAdmin: invitation.groupId.adminIds[0].username,
			receivedAt: invitation.receivedAt,
		}));
		res.send(invitations);
	} catch (e) {
		next(e);
	}
}

async function declineGroupInvitationHandler(req, res, next) {
	try {
		const {
			user,
			body: { groupId },
		} = req;
		console.log(groupId);
		user.invitations = user.invitations.filter(
			(invitation) => !invitation.groupId.equals(groupId)
		);
		await user.save();
		for (let i = 0; i < user.invitations.length; ++i) {
			await user.populate(`invitations.${i}.groupId`).execPopulate();
			await user.populate(`invitations.${i}.groupId.adminIds`).execPopulate();
		}
		const invitations = user.invitations.map((invitation) => ({
			id: invitation.groupId._id,
			name: invitation.groupId.name,
			createdAt: invitation.groupId.createdAt,
			groupAdmin: invitation.groupId.adminIds[0].username,
			receivedAt: invitation.receivedAt,
		}));
		res.send(invitations);
	} catch (e) {
		next(e);
	}
}

async function leaveGroupHandler(req, res, next) {
	try {
		const { user, group } = req;
		if (group.adminIds.includes(user._id)) {
			res.status(406);
			throw new Error('You are Group Admin.');
		}
		const session = await getGroupSessionHandler(group._id);
		if (session) {
			console.log(session.participants);
			session.participants = session.participants.filter(
				({ userId: participantId }) => !participantId.equals(user._id)
			);
			await session.save();
		}
		user.groups = user.groups.filter((group) => !group.equals(group._id));
		await user.save();
		await user.populate('groups').execPopulate();
		res.send(user.groups);
	} catch (e) {
		next(e);
	}
}

async function sendResetTokenHandler(req, res, next) {
	try {
		const user = await User.findOne({ email: req.params.email });
		if (!user) {
			res.status(404);
			throw new Error('User not found.');
		}
		const key = generateKey(6);
		user.resetToken = {
			key,
			expiresIn: new Date(Date.now() + timeValues.hour),
		};
		await user.save();
		sendResetTokenMail('zlatanovic007@gmail.com', key);
		res.send(user);
	} catch (e) {
		next(e);
	}
}
function generateKey(len) {
	var newPassword = [];
	var characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (var i = 0; i < len; i++) {
		newPassword.push(
			characters.charAt(Math.floor(Math.random() * characters.length))
		);
	}
	return newPassword.join('');
}
async function changePasswordHandler(req, res, next) {
	try {
		const user = await User.findOne({ email: req.params.email });
		if (!user) {
			res.status(404);
			throw new Error('User not found.');
		}
		const rtKey = user.resetToken.key;
		if (
			user.resetToken &&
			(user.resetToken.expiresIn.getTime() < Date.now() ||
				!(await bcrypt.compare(req.params.key, rtKey)))
		) {
			throw new Error('Invalid reset token');
		}

		user.resetToken.expiresIn = new Date(Date.now());
		await user.save();
		console.log(user.resetToken);
		const token = await user.generateAuthToken();

		res.send({ user, token });
	} catch (e) {
		next(e);
	}
}

async function deleteUserHandler(req, res, next) {
	try {
		if (req.user.groups.length > 0) {
			await req.user.populate('groups').execPopulate();
			for (const group of req.user.groups) {
				if (group.adminIds.includes(req.user._id)) {
					await deleteSingleGroupHandler(group);
				}
			}
		}

		await req.user.remove();
		res.send(req.user);
	} catch (e) {
		next(e);
	}
}

async function getAllUsersHandler(req, res, next) {
	try {
		const {
			user,
			query: { searchTerm, ...query },
		} = req;
		const searchValue = query[searchTerm];
		delete query[searchTerm];
		const options = optionsBuilder(
			query.limit,
			query.skip,
			query.sortBy,
			query.sortValue
		);
		const match = matchBuilder(query);
		const regex = new RegExp('.*' + searchValue + '.*');
		match[searchTerm] = { $regex: regex };
		console.log(searchTerm);
		console.log(match);
		const users = await Promise.all(
			(
				await User.find(
					{
						_id: { $ne: user._id },
						...match,
					},
					'',
					options
				)
			).map(async (user) => {
				await user.populate('avatar', '_id picture').execPopulate();
				const { username, email, id: _id, avatar } = user;
				return {
					username,
					email,
					avatar: avatar ? avatar : null,
					id: _id,
				};
			})
		);
		res.send(users);
	} catch (e) {
		next(e);
	}
}

async function getCurrentUserHandler(req, res, next) {
	try {
		const { user } = req;
		res.send(user);
	} catch (err) {
		console.log(erre);
	}
}
async function deleteAnyUserHandler(req, res, next) {
	try {
		if (!req.admin) {
			res.status(403);
			throw new Error('You are not admin.');
		}
		const user = User.findById(req.params.userId);
		if (user.groups.length) {
			user.groups.forEach((groups) => {
				if (groups.adminIds.includes(user._id)) {
					deleteSingleGroupHandler(groups);
				}
			});
		}
		await user.remove();
		res.send(user);
	} catch (e) {
		next(e);
	}
}

async function getUserContactsHandler(req, res, next) {
	try {
		const {
			user,
			query: { limit, skip, searchValue },
		} = req;
		let re;
		if (searchValue)
			re = new RegExp(`(?=^(?!${user.username}$).*$)(?=.*${searchValue}.*)`);
		let match = {};
		if (re) match = { searchTags: { $regex: re, $options: 'i' } };
		const sessions = await Session.find(
			{
				...match,
				participants: { $elemMatch: { userId: user._id } },
			},
			['groupId', 'participants', 'searchTags'],
			{
				skip: Number(skip),
				limit: Number(limit),
				sort: {
					lastMessageDate: -1,
				},
			}
		);
		console.log(sessions);
		const contacts = [];
		for (session of sessions) {
			let contactObject = {};
			participant = session.participants.find((participant) =>
				participant.userId.equals(req.user._id)
			);
			contactObject.newMessages = participant.newMessages;
			if (session.groupId) {
				const group = await Group.findById(session.groupId);
				await group.populate('avatar', '_id picture').execPopulate();
				await group.populate('members').execPopulate();
				contactObject.contact = {
					id: group.id,
					_id: group._id,
					name: group.name,
					isGroup: true,
					active: group.members.reduce(
						(acc, member) =>
							member._id.equals(user._id)
								? acc
								: member.active
								? member.active
								: acc,
						false
					),
					avatar: group.avatar,
				};
				contacts.push(contactObject);
			} else {
				const contact = await User.findById(
					session.participants[0].userId.equals(user._id)
						? session.participants[1].userId
						: session.participants[0].userId
				);
				console.log(contact);
				await contact.populate('avatar', '_id picture').execPopulate();
				contactObject.contact = {
					id: contact.id,
					_id: contact._id,
					name: contact.username,
					isGroup: false,
					active: contact.active,
					avatar: contact.avatar,
				};
				contacts.push(contactObject);
			}
		}
		res.send(contacts);
	} catch (e) {
		next(e);
	}
}

module.exports = {
	createUserHandler,
	loginUserHandler,
	logoutUserHandler,
	getProfileHandler,
	getCurrentUserHandler,
	getUserHandler,
	getAllUsersHandler,
	updateUserHandler,
	deleteUserHandler,
	sendGroupInvitationHandler,
	getGroupInvitationsHandler,
	acceptGroupInvitationHandler,
	declineGroupInvitationHandler,
	deleteAnyUserHandler,
	getUserByEmailHandler,
	getUserMessagesHandler,
	getGroupMessagesHandler,
	getUserByUsernameHandler,
	setAvatarHandler,
	getAvatarHandler,
	sendResetTokenHandler,
	getFriendsHandler,
	getFriendRequestsHandler,
	sendFriendRequestHandler,
	acceptFriendRequestHandler,
	declineFriendRequestHandler,
	changePasswordHandler,
	leaveGroupHandler,
	removeUserFromFriendsHandler,
	removeUserFromGroupHandler,
	getUserContactsHandler,
};
