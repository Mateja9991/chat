// const { Server: SocketServer } = require('socket.io');
var mongoose = require('mongoose');
const socketio = require('socket.io');

const { User, Group, Session, Message } = require('../db/models');
const OnlineUsersServices = require('./utils/socket.utils');
const { getSessionHandler } = require('../services/session.service');
const {
	SOCKET_EVENTS,
	PING_INTERVAL,
	RESPONSE_TIMER,
} = require('../constants');
const { jwtSocketAuth } = require('./socket.auth/');

class SocketService {
	initializeSocketServer(server) {
		this.io = socketio(server, {
			cors: {
				origin: '*',
				methods: '*',
			},
		});
		// this.io.on('connection', () => {
		// 	console.log('Visitor connected');
		// });
		this.io
			.use(this.middleware.bind(this))
			.on('connection', this._userOnConnect.bind(this));
		setInterval(() => this.pingActiveUsers(), PING_INTERVAL);
	}
	async pingActiveUsers() {
		const activeUsers = await User.find({ active: true });
		// console.log('active users');
		// console.log(activeUsers);
		activeUsers.forEach((user) => {
			OnlineUsersServices.pingUser(user._id, this.sendEventToRoom.bind(this));

			this.sendEventToRoom(user._id, SOCKET_EVENTS.CHECK_CONNECTION, {});
		});
		setTimeout(() => {
			OnlineUsersServices.clearNotResponsiveUsers(
				this.sendEventToRoom.bind(this)
			);
		}, RESPONSE_TIMER);
	}
	async middleware(socketClient, next) {
		try {
			await jwtSocketAuth(socketClient, this.sendEventToRoom.bind(this));

			if (!socketClient.user) {
				next(new Error('Not Authorized'));
			}
			next();
		} catch (e) {
			console.log(e.message);
			next(new Error('Not Authorized'));
		}
	}
	async _userOnConnect(socketClient) {
		console.log('client socket connected!');
		socketClient.use(async (packet, next) => {
			try {
				socketClient.user = await User.findById(socketClient.user._id);
			} catch (err) {
				next(err);
			}
			next();
		});
		socketClient.on('disconnect', async () => {
			console.log('Tab closed');
		});
		socketClient.on('logout', () => {
			socketClient.disconnect(true);
		});
		socketClient.on('keepAlive', () => {
			console.log('keep Alive event');
			OnlineUsersServices.connectionAlive(socketClient.user._id);
		});
		socketClient.on('newMessageToSession', async (sessionId, payload) => {
			sessionId = mongoose.Types.ObjectId(sessionId);
			await sendMessageToSessionHandler(
				sessionId,
				socketClient.user._id,
				payload
			);
		});
		socketClient.on(
			'userStartedTyping',
			async (userId, sessionId, isGroupChat, participantId) => {
				try {
					console.log('user started');
					if (isGroupChat) {
						const members = await User.find({ groups: sessionId }, 'id').lean();
						members.forEach(({ _id: memberId }) =>
							this.sendEventToRoom(
								memberId,
								SOCKET_EVENTS.USER_STARTED_TYPING,
								{
									userId,
									username: socketClient.user.username,
									sessionId,
								}
							)
						);
					} else {
						this.sendEventToRoom(
							participantId,
							SOCKET_EVENTS.USER_STARTED_TYPING,
							{
								userId,
								username: socketClient.user.username,
								sessionId,
							}
						);
					}
				} catch (err) {
					console.log(err);
				}
			}
		);
		socketClient.on(
			'userStoppedTyping',
			async (userId, sessionId, isGroupChat, participantId) => {
				try {
					console.log('user stopped');
					if (isGroupChat) {
						const members = await User.find(
							{ groups: sessionId },
							'_id'
						).lean();
						console.log(members);
						members.forEach(({ _id: memberId }) =>
							this.sendEventToRoom(
								memberId,
								SOCKET_EVENTS.USER_STOPPED_TYPING,
								{
									userId,
									username: socketClient.user.username,
									sessionId,
								}
							)
						);
					} else {
						this.sendEventToRoom(
							participantId,
							SOCKET_EVENTS.USER_STOPPED_TYPING,
							{
								userId,
								username: socketClient.user.username,
								sessionId,
							}
						);
					}
				} catch (err) {
					console.log(err);
				}
			}
		);
		socketClient.on('userSeenMessage', async (messageId) => {
			try {
				const msg = await Message.findById(messageId);
				const {
					user: { _id: currentUserId, username: currentUserUsername },
				} = socketClient;
				if (msg) {
					const session = await Session.findById(msg.sessionId).lean();
					if (
						!session.participants.some(({ userId }) =>
							currentUserId.equals(userId)
						)
					)
						throw new Error('Unauthorized.');
					if (
						!msg.seenBy.filter((userId) => currentUserId.equals(userId)).length
					) {
						!msg.seenBy.filter((userId) => {
							return currentUserId.equals(userId);
						}).length;
						const session = await Session.findById(msg.sessionId);
						// const participant = await session.participants.find((participant) =>
						// 	participant.userId.equals(currentUserId)
						// );
						for (const participant of session.participants) {
							if (participant.userId.equals(currentUserId)) {
								if (participant.newMessages > 0) {
									participant.newMessages--;
									await session.save();
								}
								break;
							}
						}

						msg.seenBy.push(currentUserId);
						await msg.save();
						console.log('user seen message');
						session.participants.forEach(({ userId }) =>
							this.sendEventToRoom(userId, SOCKET_EVENTS.USER_SEEN_MESSAGE, {
								sessionId: session._id,
								userId: currentUserId,
								username: currentUserUsername,
								messageId,
							})
						);
					}
				} else {
					throw new Error(`No message with id ${messageId} .`);
				}
			} catch (err) {
				console.log(err);
			}
		});
		socketClient.on('userUnsentMessage', async (messageId) => {
			try {
				const msg = await Message.findById(messageId);
				const {
					user: { _id: currentUserId },
				} = socketClient;
				if (msg) {
					const sessionId = msg.sessionId;
					if (!msg.from.equals(currentUserId))
						throw new Error('Not authorized');
					const session = await Session.findById(sessionId).lean();
					msg.remove();
					session.participants.forEach(({ userId }) =>
						this.sendEventToRoom(userId, SOCKET_EVENTS.USER_UNSENT_MESSAGE, {
							sessionId,
							messageId,
						})
					);
				} else {
					throw new Error(`No message with id ${messageId}.`);
				}
			} catch (err) {
				console.log(err);
			}
		});
		socketClient.on('newMessageToUser', async (id, payload) => {
			try {
				console.log(id);
				console.log('eve poruka');
				const user = await User.findById(id);
				if (!user) {
					throw new Error('User not found.');
				}
				const sessionParticipants = [socketClient.user._id, user._id];
				console.log(sessionParticipants);
				const session = await getSessionHandler(sessionParticipants);

				await sendMessageToSessionHandler(
					session._id,
					socketClient.user._id,
					payload
				);
				socketClient.user = await User.findById(socketClient.user._id);
			} catch (e) {
				console.log(e);
			}
		});
		socketClient.on('newMessageToGroup', async (groupId, payload) => {
			try {
				console.log('to group!');
				groupId = mongoose.Types.ObjectId(groupId);
				const group = await Group.findById(groupId);
				console.log(group);
				if (!group) {
					throw new Error('Group not found.');
				}
				const session = await getSessionHandler(undefined, groupId);
				await sendMessageToSessionHandler(
					session._id,
					socketClient.user._id,
					payload
				);
			} catch (e) {
				console.log(e);
			}
		});
	}

	sendEventToRoom(room, eventName, payload) {
		this.io.to(room.toString()).emit(eventName, payload);
	}
}
const Socket = new SocketService();

async function sendMessageEvent(room, payload) {
	Socket.sendEventToRoom(room, SOCKET_EVENTS.NEW_MESSAGE, payload);
}

async function sendMessageToSessionHandler(
	sessionId,
	senderId,
	{ text, contentType, content, fileName }
) {
	try {
		console.log(text, contentType, content);
		console.log(fileName);
		let session = await Session.findById(sessionId);
		const sender = await User.findById(senderId);
		console.log(session);
		if (!session) {
			throw new Error('Session not found.');
		}
		const msg = new Message({
			text,
			content,
			contentType,
			fileName,
			sessionId: sessionId,
			from: sender._id,
		});
		session.lastMessageDate = Date.now();
		await session.save();
		msg.seenBy.push(sender._id);
		await msg.save();
		await msg
			.populate([
				{
					path: 'seenBy',
					select: 'username _id id',
					options: { lean: true },
				},
				{
					path: 'from',
					select: '_id id avatar',
					populate: {
						path: 'avatar',
						select: '_id small',
						options: { lean: true },
					},
				},
			])
			.execPopulate();
		console.log(msg);
		for (const participant of session.participants) {
			if (!participant.userId.equals(sender._id)) participant.newMessages++;

			// if (!participant.userId.equals(senderId)) {
			// 	console.log(sender.username);
			sendMessageEvent(participant.userId, {
				sessionId: session.id,
				sessionKey: session.groupId ? session.groupId : senderId,
				user: sender,
				message: {
					id: msg._id,
					text,
					contentType,
					content,
					from: msg.from,
					fileName,
					seenBy: msg.seenBy,
				},
			});
			// }
		}
		await session.save();
	} catch (e) {
		console.log(e);
	}
}

module.exports = Socket;
