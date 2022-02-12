const { Schema, model } = require('mongoose');
const { MODEL_PROPERTIES } = require('../../constants');
const User = require('./user.model');
const Session = require('./session.model');
//
//              Schema
//
const groupSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		avatar: {
			type: Schema.Types.ObjectId,
			ref: MODEL_PROPERTIES.AVATAR.NAME,
		},
		description: {
			type: String,
		},
		adminIds: [
			{
				type: Schema.Types.ObjectId,
				required: true,
				ref: MODEL_PROPERTIES.USER.NAME,
			},
		],
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);
// teamSchema.index({ leaderId: 1 });
// teamSchema.index({ name: 1, leaderId: 1 }, { unique: true });
//
//              Virtuals
//

groupSchema.virtual('members', {
	ref: MODEL_PROPERTIES.USER.NAME,
	localField: '_id',
	foreignField: 'groups',
});

groupSchema.pre('remove', async function () {
	const session = await Session.findOne({ groupId: this._id });
	if (session) await session.remove();
});
//
//
//
const Group = model(MODEL_PROPERTIES.GROUP.NAME, groupSchema);

module.exports = Group;
