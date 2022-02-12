const { User, Session } = require('../../db/models');
const { SOCKET_EVENTS } = require('../../constants');

let pingedUsers = [],
	acksMissed = [],
	onlineUsers = [],
	offlineUsers = [];

async function pingUser(userId, sendEvent) {
	//console.log('pinging user!!!');
	if (
		!onlineUsers.filter((onlineUserId) => onlineUserId.equals(userId)).length
	) {
		onlineUsers.push(userId);
		const sessions = await Session.find({
			participants: { $elemMatch: { userId: userId } },
		});
		for (const session of sessions) {
			if (session.groupId) {
				await session.populate('participants.userId').execPopulate();
				session.participants
					.filter(
						({ userId: { active, _id } }) => !_id.equals(userId) && active
					)
					.forEach(({ userId: { _id: participantId } }) => {
						const payload = {
							userId: session.groupId,
							active: true,
						};
						// console.log(payload);
						sendEvent(
							participantId,
							SOCKET_EVENTS.USER_STATUS_CHANGED,
							payload
						);
					});
			} else {
				console.log('else');
				session.participants.forEach(({ userId: participantId }) =>
					sendEvent(participantId, SOCKET_EVENTS.USER_STATUS_CHANGED, {
						userId,
						active: true,
					})
				);
			}
		}
	}
	if (!pingedUsers.find((el) => el.equals(userId))) pingedUsers.push(userId);
	//console.log('pinged after pinging');
	//console.log(pingedUsers);
}

async function connectionAlive(userId) {
	const pingedIndex = pingedUsers.findIndex((pingedUser) =>
		pingedUser.equals(userId)
	);
	if (pingedIndex !== -1) pingedUsers.splice(pingedIndex, 1);
	const ackIndex = acksMissed.findIndex((ackUser) =>
		ackUser.userId.equals(userId)
	);
	if (ackIndex !== -1) acksMissed[ackIndex].count = 0;
}

async function clearNotResponsiveUsers(sendEvent) {
	//console.log('pinged users:');
	//console.log(pingedUsers);
	//console.log('acks missed from users:');
	//console.log(acksMissed);
	for (const pingedUserId of pingedUsers) {
		//console.log(pingedUserId);
		let index = acksMissed.findIndex((el) => el.userId.equals(pingedUserId));
		if (index !== -1) {
			if (acksMissed[index].count > 3) {
				offlineUsers.push(pingedUserId);
				acksMissed[index].count = 0;
			} else {
				acksMissed[index].count++;
			}
		} else {
			acksMissed.push({ userId: pingedUserId, count: 1 });
		}
	}
	await updateOfflineUsers(sendEvent);
	pingedUsers = [];
}

async function updateOfflineUsers(sendEvent) {
	//console.log(offlineUsers);
	//console.log('about to be offline:');
	for (const offlineUserId of offlineUsers) {
		const onlineIndex = onlineUsers.findIndex((userId) =>
			userId.equals(offlineUserId)
		);
		if (onlineIndex !== -1) onlineUsers.splice(onlineIndex, 1);
		const offlineUser = await User.findById(offlineUserId);
		offlineUser.active = false;
		await offlineUser.save();

		const sessions = await Session.find({
			participants: { $elemMatch: { userId: offlineUser._id } },
		});

		for (const session of sessions) {
			let active = false;
			if (session.groupId) {
				await session.populate('participants.userId').execPopulate();
				if (
					session.participants.filter(({ userId: { active } }) => active)
						.length == 1
				) {
					//console.log('saljemo ovom useru!!!!');
					//console.log(
					// 	session.participants.filter(({ userId: { active } }) => active)
					// );
					console.log(session.groupId);
					const payload = {
						userId: session.groupId,
						active: false,
					};
					session.participants
						.filter(({ userId: { active } }) => active)
						.forEach(({ userId: { _id: participantId } }) =>
							sendEvent(
								participantId,
								SOCKET_EVENTS.USER_STATUS_CHANGED,
								payload
							)
						);
				}
			} else {
				session.participants.forEach(({ userId: participantId }) =>
					sendEvent(participantId, SOCKET_EVENTS.USER_STATUS_CHANGED, {
						userId: offlineUserId,
						active: false,
					})
				);
			}
		}
	}
	offlineUsers = [];
}

module.exports = {
	pingUser,
	clearNotResponsiveUsers,
	connectionAlive,
};
