const { Message } = require('../db/models');

async function unsendMessageHandler() {}
async function deleteMessageHandler(req, res, next) {
	try {
		const {
			message,
			user: { _id: userId },
			// query: { limit },
		} = req;
		if (message.deletedBy.some((currentId) => currentId.equals(userId)))
			throw new Error('Already deleted!');
		message.deletedBy.push(userId);
		await message.save();
		res.send({ success: true });
	} catch (err) {
		console.log(err);
	}
}

module.exports = {
	deleteMessageHandler,
};
