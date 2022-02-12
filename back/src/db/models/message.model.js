const { Schema, model } = require('mongoose');
const { MODEL_PROPERTIES } = require('../../constants');
const Counter = require('./counter.model');
//
//              Schema
//
const messageSchema = new Schema(
	{
		text: {
			type: String,
			maxlength: [250, 'Message too long. (>250)'],
		},
		serialNumber: {
			type: Number,
			required: true,
			default: 0,
		},
		fileName: {
			type: String,
		},
		content: {
			type: String,
		},
		contentType: {
			type: String,
			enum: ['image', 'text', 'audio', 'none'],
			default: 'none',
		},
		seenBy: [
			{
				type: Schema.Types.ObjectId,
				required: true,
				ref: MODEL_PROPERTIES.USER.NAME,
			},
		],
		deletedBy: [
			{
				type: Schema.Types.ObjectId,
				required: true,
				ref: MODEL_PROPERTIES.USER.NAME,
			},
		],
		sessionId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: MODEL_PROPERTIES.SESSION.NAME,
		},
		from: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: MODEL_PROPERTIES.USER.NAME,
		},
	},
	{ timestamps: true }
);
messageSchema.index({ sessionId: 1 });
//
//
//
// messageSchema.pre('save', async function (next) {
// 	if (this.isNew) {
// 		let messageCounter = await Counter.findById(this.sessionId);
// 		console.log(`found : ${messageCounter}`);
// 		if (!messageCounter) {
// 			messageCounter = new Counter();
// 			messageCounter._id = this.sessionId;
// 			await messageCounter.save();
// 		}
// 		this.serialNumber = messageCounter.seq++;
// 		await messageCounter.save();
// 		console.log(messageCounter);
// 		next();
// 	}
// });
const Message = model(MODEL_PROPERTIES.MESSAGE.NAME, messageSchema);

module.exports = Message;
