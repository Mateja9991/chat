const Avatar = require('./avatar.model');
const User = require('./user.model');
const Session = require('./session.model');
const Message = require('./message.model');
const Group = require('./group.model');

// Project.find({}).then((projects) => {
// 	for (const project of projects) {
// 		project.remove().then(() => {
// 			console.log('ok');
// 		});
// 	}
// });

module.exports = {
	Avatar,
	User,
	Session,
	Message,
	Group,
};
