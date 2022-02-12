const { Schema, model } = require('mongoose');
const { MODEL_PROPERTIES } = require('../../constants');
const Message = require('./message.model');
const Group = require('./group.model');
const User = require('./user.model');

//
//              Schema
//
const sessionSchema = new Schema({
	groupId: {
		type: Schema.Types.ObjectId,
		ref: MODEL_PROPERTIES.GROUP.NAME,
		sparse: true,
	},
	lastMessageDate: {
		type: Date,
		default: Date.now,
	},
	searchTags: [
		{
			type: String,
		},
	],
	participants: [
		{
			newMessages: {
				type: Number,
				default: 0,
			},
			userId: {
				type: Schema.Types.ObjectId,
				required: true,
				ref: MODEL_PROPERTIES.USER.NAME,
			},
		},
	],
});
//
//              Middleware
//
sessionSchema.methods.updateParticipants = async function () {};

sessionSchema.pre('save', async function (next) {
	if (this.isNew) {
		if (this.groupId) {
			const group = await Group.findById(this.groupId);

			this.searchTags.push(group.name);
		}
		let user;
		for (const participant of this.participants) {
			user = await User.findById(participant.userId);
			this.searchTags.push(user.username);
		}
	}
	console.log(this.searchTags);
	next();
});

sessionSchema.pre('remove', async function () {
	const messages = await Message.find({ sesionId: this._id });
	for (const msg of messages) {
		await msg.remove();
	}
});
//
const Session = model(MODEL_PROPERTIES.SESSION.NAME, sessionSchema);

module.exports = Session;
