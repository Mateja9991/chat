const { jwtAuthMiddleware } = require('./jwt_authorization_middleware');
const { ownershipAuthMiddleware } = require('./ownership_auth_middleware');
const { groupAdminAuth, groupMemberAuth } = require('./group.authorization.js');
const { sessionAuth } = require('./session.auth');
const { messageToUserAuth } = require('./message.auth');
// const {
// 	commentToLeaderAuth,
// 	commentToMemberAuth,
// } = require('./comment.authorization.js');
const { adminAuth } = require('./admin.authorization.js');
const { noteToLeaderAuth } = require('./note.authorization');
module.exports = {
	jwtAuthMiddleware,
	ownershipAuthMiddleware,
	groupAdminAuth,
	groupMemberAuth,
	// commentToLeaderAuth,
	// commentToMemberAuth,
	adminAuth,
	noteToLeaderAuth,
	sessionAuth,
	messageToUserAuth,
};
