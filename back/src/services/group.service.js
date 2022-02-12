const { User, Group, Session } = require('../db/models');
const {
	newSessionHandler,
	getSessionMessagesHandler,
} = require('./session.service');
const {
	optionsBuilder,
	queryHandler,
	matchBuilder,
	destructureObject,
	// newNotification,
	// notifyUsers,
	checkAndUpdate,
} = require('./utils');
const Socket = require('../socket/socket');
const { SOCKET_EVENTS } = require('../constants/socket_events');

//
//				ROUTER HANDLERS
//
const { MODEL_PROPERTIES } = require('../constants');
const selectFields = MODEL_PROPERTIES.GROUP.SELECT_FIELDS;
const allowedKeys = MODEL_PROPERTIES.GROUP.ALLOWED_KEYS;

async function createGroupHandler(req, res, next) {
	try {
		const { user } = req;
		await user.populate('groups').execPopulate();
		// await duplicateHandler(Group, 'leaderId', req.user._id, req.body);
		const groupObject = destructureObject(req.body, allowedKeys.CREATE);
		const group = new Group({
			...groupObject,
			adminIds: [req.user._id],
		});
		await group.save();
		user.groups.push(group._id);
		await user.save();
		await newSessionHandler(undefined, group._id);
		await user.populate('groups').execPopulate();
		console.log(user.groups);
		console.log('^^ GROUPS ^^');
		res.send(mapGroups(user.groups));
	} catch (e) {
		next(e);
	}
}
const mapGroups = (groups) =>
	groups.map(({ id, avatar, name, adminIds, createdAt }) => ({
		id,
		name,
		groupAdmin: adminIds[0].username,
		createdAt,
		avatar,
	}));
async function getAllUserGroupsHandler(req, res, next) {
	try {
		const { user } = req;
		const options = optionsBuilder(
			req.query.limit,
			req.query.skip,
			req.query.sortBy,
			req.query.sortValue
		);
		const match = matchBuilder(req.query);
		await user
			.populate({
				path: 'groups',
				match,
				options,
				populate: [
					{
						path: 'adminIds',
					},
					{
						path: 'avatar',
					},
				],
			})
			.execPopulate();

		res.send(mapGroups(user.groups));
	} catch (e) {
		next(e);
	}
}

// async function getLeaderGroupsHandler(req, res, next) {
// 	try {
// 		let allLeaderGroups;
// 		await req.user.populate('groups').execPopulate();
// 		if (req.query.sortBy) {
// 			allLeaderGroups = req.user.groups.filter((item) =>
// 				item.leaderId.equals(req.user._id)
// 			);
// 		} else {
// 			const sortedGroups = await sortUserGroups(req.user);
// 			allLeaderGroups = sortedGroups.filter((item) =>
// 				item.leaderId.equals(req.user._id)
// 			);
// 		}
// 		const requestedGroups = queryHandler(
// 			allLeaderGroups,
// 			req.query,
// 			selectFields
// 		);
// 		res.send(requestedGroups);
// 	} catch (e) {
// 		next(e);
// 	}
// }

// async function sortUserGroups(user) {
// 	const groups = user.groups;
// 	const tmp = groups.map((group) => {
// 		const numberOfVisits = user.visits.filter((vis) =>
// 			vis.groupId.equals(group._id)
// 		).length;
// 		console.log(numberOfVisits);
// 		return {
// 			group,
// 			numberOfVisits,
// 		};
// 	});
// 	tmp.sort((a, b) => {
// 		if (a.numberOfVisits < b.numberOfVisits) return 1;
// 		return -1;
// 	});
// 	console.log(tmp.map((vis) => vis.numberOfVisits));
// 	return tmp.map((vis) => vis.group);
// }

async function getGroupHandler(req, res, next) {
	try {
		// console.log(req.user.visits.length);
		// if (req.user.visits.length >= 8) {
		// 	const searchDate = req.user.visits.reduce((date, visit) => {
		// 		if (date > visit.date.getTime()) date = visit.date.getTime();
		// 		return date;
		// 	}, Date.now());
		// console.log(searchDate);
		// req.user.visits = req.user.visits.filter(
		// 	(visit) => !(visit.date.getTime() === searchDate)
		// );
		// }
		// req.user.visits.push({
		// 	groupId: req.group._id,
		// 	date: Date.now(),
		// });
		// await req.user.save();
		await req.group.execPopulate();
		await req.group.populate('avatar').execPopulate();
		return res.send(req.group);
	} catch (e) {
		next(e);
	}
}

async function getMembersHandler(req, res, next) {
	try {
		const options = optionsBuilder(
			req.query.limit,
			req.query.skip,
			req.query.sortBy,
			req.query.sortValue
		);
		const match = matchBuilder(req.query);
		const members = await User.find(
			{
				groups: req.group._id,
				...match,
			},
			MODEL_PROPERTIES.USER.SELECT_FIELDS,
			options
		);
		console.log(req.group);
		console.log(req.group.adminIds);
		for (let i = 0; i < members.length; ++i) {
			await members[i].populate('avatar').execPopulate();
		}
		const requestedMembers = await attachRoles(members, req.group.adminIds);
		console.log(requestedMembers);

		// console.log(members);
		res.send(
			requestedMembers.map(({ id, username, email, role, avatar }) => ({
				id,
				username,
				email,
				role,
				avatar,
			}))
		);
	} catch (e) {
		next(e);
	}
}
async function attachRoles(members, adminIds) {
	return Promise.all(
		members.map(async (member) => {
			// await member.populate('avatar').execPopulate();
			memberObject = member.toObject();
			memberObject.role = adminIds.includes(member._id) ? 'admin' : 'member';
			return memberObject;
		})
	);
}

async function getAllGroups(req, res, next) {
	try {
		const options = optionsBuilder(
			req.query.limit,
			req.query.skip,
			req.query.sortBy,
			req.query.sortValue
		);
		const match = matchBuilder(req.query);
		const requestedGroups = await Group.find(
			{
				...match,
			},
			selectFields,
			options
		);
		await Promise.all(
			requestedGroups.map(async (group) => {
				await group.populate('avatar').execPopulate();
				return group;
			})
		);
		res.send(requestedGroups);
	} catch (e) {
		next(e);
	}
}

async function updateGroupHandler(req, res, next) {
	try {
		const oldName = req.group.name;
		await checkAndUpdate('GROUP', req.group, req.body, res);
		await req.group.populate('members').execPopulate();
		// await notifyUsers(req.group.members, {
		// 	event: {
		// 		text: `${req.user.username} has updated group ${oldName}.`,
		// 		reference: req.group,
		// 	},
		// });
		res.send(req.group);
	} catch (e) {
		next(e);
	}
}

async function deleteGroupHandler(req, res, next) {
	try {
		await deleteSingleGroupHandler(req.group);
		await req.user.populate('groups').execPopulate();
		res.send(req.user.groups);
	} catch (e) {
		next(e);
	}
}

async function deleteSingleGroupHandler(group) {
	const users = await User.find({
		groups: group._id,
	});
	for (const user of users) {
		user.groups = user.groups.filter((groupId) => !groupId.equals(group));
		await user.save();
	}
	// for (const user of users) {
	// 	await newNotification(user, {
	// 		event: {
	// 			text: `Group '${group.name}' has been deleted.`,
	// 			reference: group,
	// 		},
	// 	});
	// }
	await group.remove();
}

async function getGroupMessagesHandler(req, res, next) {
	try {
		const {
			params: { groupId },
		} = req;
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
			console.log('group seenBy is');
			console.log(msg.seenBy);
			if (!msg.seenBy.some((userId) => req.user._id.equals(userId))) {
				console.log('not seen!!!!');
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

module.exports = {
	createGroupHandler,
	getAllUserGroupsHandler,
	getGroupHandler,
	updateGroupHandler,
	deleteGroupHandler,
	deleteSingleGroupHandler,
	getMembersHandler,
	getAllGroups,
	getGroupMessagesHandler,
};
