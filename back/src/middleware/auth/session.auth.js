const { Session } = require('../../db/models');
async function sessionAuth(req, res, next) {
	try {
		const {
			params: { sessionId },
			user: { id },
		} = req;
		console.log(req.params);
		console.log(sessionId);
		const session = await Session.findById(sessionId);
		if (!session.participants.some(({ userId }) => userId.equals(id)))
			throw new Error(
				'Not Authorized. To access this document you need to be admin.'
			);
		req.session = session;
		next();
	} catch (e) {
		next(e);
	}
}

module.exports = {
	sessionAuth,
};
