const { Session, Message } = require('../../db/models');
async function messageToUserAuth(req, res, next) {
	try {
		const {
			params: { messageId },
			user: { _id },
		} = req;
		const message = await Message.findById(messageId);
		const sessions = await Session.find({
			participants: { $elemMatch: { userId: _id } },
		});
		if (
			!sessions.some(({ _id: sessionId }) =>
				sessionId.equals(message.sessionId)
			)
		)
			throw new Error('Not Authorized.');
		req.message = message;
		next();
	} catch (e) {
		next(e);
	}
}

module.exports = {
	messageToUserAuth,
};
