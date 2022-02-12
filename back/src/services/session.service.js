const { User, Session, Message } = require('../db/models');
const { optionsBuilder, destructureObject } = require('./utils/services.utils');

async function getContentFromSession(req, res, next) {
	try {
		const {
			session: { id: sessionId },
			user,
			params: { contentType },
			query,
		} = req;
		console.log(req);
		console.log(query);
		const options = optionsBuilder(
			query.limit,
			query.skip,
			query.sortBy,
			query.sortValue
		);
		console.log(options);
		const messages = await Message.find(
			{ sessionId, contentType },
			'',
			options
		).lean();
		console.log(messages.length);
		console.log(
			messages.filter((el) => el.contentType == 'text' && el.fileName)
		);
		res.send(messages);
	} catch (e) {
		next(e);
	}
}

async function searchMessageHistoryHandler(req, res, next) {
	try {
		const {
			user: { id: userId },
			query: { searchTerm, skip, totalNumReq },
			session,
		} = req;

		const re = new RegExp(searchTerm);
		const searchQuery = {
			sessionId: session._id,
			deletedBy: {
				$ne: userId,
			},
			$or: [
				{ text: { $regex: re, $options: 'i' } },
				{ fileName: { $regex: re, $options: 'i' } },
			],
		};

		const foundMessage = await Message.findOne(searchQuery, 'createdAt', {
			skip: Number(skip),
		}).lean();
		let totalNum = 0;
		if (totalNumReq) totalNum = await await Message.countDocuments(searchQuery);
		const amountBefore = await Message.countDocuments({
			sessionId: session._id,
			createdAt: { $lte: foundMessage.createdAt },
		});
		console.log(amountBefore);
		const requestedMessages = await Message.find(
			{ sessionId: session._id },
			'from deletedBy serialNumber seenBy text content sessionId fileName contentType createdAt id _id',
			{
				limit: 10,
				skip: amountBefore > 5 ? amountBefore - 5 : 0,
				sort: {
					createdAt: 1,
				},
			}
		);
		const mappedMessages = await Promise.all(
			requestedMessages.map(async (msg) => {
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
		console.log(mappedMessages.reverse());
		res.send({ messages: mappedMessages.reverse(), totalNum });
	} catch (e) {
		next(e);
	}
}

async function getMessagesHandler(req, res, next) {
	try {
		const {
			session: { id: sessionId },
			user,
			params: { contentType },
		} = req;
		res.send(session);
	} catch (e) {
		next(e);
	}
}

async function createPrivateSessionHandler(req, res, next) {
	try {
		const session = getSessionHandler([
			req.user._id.toString(),
			req.params.userId,
		]);
		res.send(session);
	} catch (e) {
		next(e);
	}
}

async function getUsersPrivateSessions(req, res, next) {
	try {
		const sessions = await Session.find({
			participants: { $elemMatch: { userId: req.user._id } },
			groupId: { $exists: false },
		}).lean();
		res.send(sessions);
	} catch (e) {
		next(e);
	}
}

async function getOnePrivateSession(req, res, next) {
	try {
		const session = await getPrivateSessionHandler([
			req.user._id,
			req.params.userId,
		]);

		res.send(session);
	} catch (e) {
		next(e);
	}
}

async function groupSessionHandler(req, res, next) {
	try {
		const session = await Session.findOne({
			groupId: req.params.groupId,
		}).lean();
		res.send(session);
	} catch (e) {
		next(e);
	}
}

async function getMessagesHandler(req, res, next) {
	try {
		const options = optionsBuilder(
			req.query.limit,
			req.query.skip,
			'createdAt',
			1
		);
		const sessionMessages = await Message.find(
			{
				sessionId: req.params.sessionId,
			},
			'from text createdAt -_id',
			options
		);
		res.send(sessionMessages);
	} catch (e) {
		next(e);
	}
}

async function getSessionHandler(sessionParticipants, groupId) {
	let session;
	if (groupId) {
		session = await getGroupSessionHandler(groupId);
		if (session) {
			await session.updateParticipants();
		}
	} else {
		console.log('private session');
		session = await getPrivateSessionHandler(sessionParticipants);
	}
	return session
		? session
		: await newSessionHandler(sessionParticipants, groupId);
}

async function newSessionHandler(sessionParticipants, groupId) {
	const newSession = new Session({
		groupId: groupId ? groupId : undefined,
	});
	console.log();
	if (groupId) {
		users = await User.find({
			groups: groupId,
		}).lean();
		users.forEach((user) => {
			newSession.participants.push({
				userId: user._id,
			});
		});
	} else {
		for (const userId of sessionParticipants) {
			// let user = await User.findById(userId);
			// // user.contacts.push(
			// 	sessionParticipants.find((participant) => !participant.equals(user._id))
			// );
			// await user.save();
			newSession.participants.push({
				userId,
			});
		}
	}
	await newSession.save();
	return newSession;
}

async function getSessionMessagesHandler(
	options,
	sessionParticipants,
	groupId,
	userId
) {
	try {
		let session;
		if (groupId) {
			session = await getGroupSessionHandler(groupId);
		} else {
			session = await getPrivateSessionHandler(sessionParticipants);
		}
		const deletedByQuery = userId
			? {
					deletedBy: {
						$ne: userId,
					},
			  }
			: {};
		let sessionMessages = null;
		if (session) {
			sessionMessages = await Message.find(
				{
					sessionId: session._id,
					...deletedByQuery,
				},
				'from deletedBy seenBy text content sessionId fileName contentType createdAt id _id',
				options
			);
		}
		return sessionMessages ? sessionMessages : [];
	} catch (e) {
		throw new Error(e.message);
	}
}

async function getGroupSessionHandler(groupId) {
	const session = await Session.findOne({
		groupId,
	});
	return session;
}

async function getPrivateSessionHandler(sessionParticipants) {
	const session = await Session.findOne({
		$and: [
			{ participants: { $elemMatch: { userId: sessionParticipants[0] } } },
			{ participants: { $elemMatch: { userId: sessionParticipants[1] } } },
			{ groupId: { $exists: false } },
		],
	});
	// sessions.forEach((session) => {
	// 	session.userIds = session.participants.map(
	// 		(participant) => participant.userId
	// 	);
	// 	if (
	// 		session.userIds.sort().toString() ===
	// 		sessionParticipants.sort().toString()
	// 	) {
	// 		result = session;
	// 	}
	// });
	return session;
}

async function addParticipantHandler(groupId, userId) {
	try {
		const session = await Session.findOne({ groupId });
		session.participants.forEach((par) => {
			if (par.userId.equals(userId)) {
				res.status(500);
				throw new Error('already member');
			}
		});
		session.participants.push({
			userId,
		});
		const user = await User.findById(userId);
		session.searchTags.push(user.username);
		await session.save();
		return true;
	} catch (e) {
		throw new Error('Already In session');
	}
}
module.exports = {
	addParticipantHandler,
	getContentFromSession,
	newSessionHandler,
	getGroupSessionHandler,
	searchMessageHistoryHandler,
	getSessionMessagesHandler,
	getSessionHandler,
	getPrivateSessionHandler,
	createPrivateSessionHandler,
	getUsersPrivateSessions,
	groupSessionHandler,
	getMessagesHandler,
	getOnePrivateSession,
};
