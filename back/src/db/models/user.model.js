const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Avatar = require('./avatar.model');
const { MODEL_PROPERTIES, SOCKET_EVENTS } = require('../../constants');
//
//              Schema
//
// const contactSchema = new Schema({
// 	user: {
// 		type: Schema.Types.ObjectId,
// 		required: true,
// 		ref: MODEL_PROPERTIES.USER.NAME,
// 	},
// 	newMessages: {
// 		type: Number,
// 		default: 0,
// 	},
// });
const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		role: {
			type: String,
			default: 'user',
			enum: ['user', 'admin'],
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error('Email is not valid.');
				}
			},
		},
		password: {
			type: String,
			required: true,
			trim: true,
			minlength: [5, 'Password too short (must be at least 5 characters).'],
		},
		active: { type: Boolean, default: false },
		lastActiveAt: Date,
		resetToken: {
			key: { type: String },
			expiresIn: {
				type: Date,
			},
		},
		friends: [
			{
				type: Schema.Types.ObjectId,
				required: true,
				ref: MODEL_PROPERTIES.USER.NAME,
			},
		],
		friendRequests: [
			{
				type: Schema.Types.ObjectId,
				required: true,
				ref: MODEL_PROPERTIES.USER.NAME,
			},
		],
		groups: [
			{
				type: Schema.Types.ObjectId,
				required: true,
				ref: MODEL_PROPERTIES.GROUP.NAME,
			},
		],
		invitations: [
			{
				groupId: {
					type: Schema.Types.ObjectId,
					required: true,
					ref: MODEL_PROPERTIES.GROUP.NAME,
				},
				receivedAt: {
					type: Date,
					required: true,
				},
			},
		],
		avatar: {
			type: Schema.Types.ObjectId,
			ref: MODEL_PROPERTIES.AVATAR.NAME,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
//
//              Middleware
//
//  Hash plaintext password before saving
userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 8);
	}
	if (this.isModified('resetToken') && this.resetToken) {
		this.resetToken.key = await bcrypt.hash(this.resetToken.key, 8);
	}
	console.log('user is updating');
	if (this.isModified('active') && this.active == false) {
		console.log('UPDATE NA FALSE SADA');
	}
	if (!this.avatar) {
		const count = await Avatar.countDocuments();
		const skip = Math.floor(Math.random() * count);
		this.avatar = await Avatar.findOne({}).skip(skip);
	}
	next();
});
//
//              Model methods
//
userSchema.statics.findByCredentials = async function (tag, password) {
	let user;
	if (validator.isEmail(tag)) user = await User.findOne({ email: tag });
	else user = await User.findOne({ username: tag });
	if (!user) {
		throw new Error('Unable to login.');
	}
	await user.checkPassword(password);
	return user;
};
userSchema.methods.checkPassword = async function (password) {
	if (!(await bcrypt.compare(password, this.password))) {
		throw new Error('Incorrect password.');
	}
};
userSchema.statics.generateTag = async () => {
	const lastTag = await User.countDocuments({});

	let tag = lastTag;
	tag = tag.toString();
	tag = '#' + tag.padStart(9, '0');

	return tag;
};
//
//              Document methods
//
userSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject();

	delete userObject.password;
	delete userObject.invitations;
	delete userObject.role;
	delete userObject.groups;
	delete userObject.friendRequests;
	delete userObject.friends;
	delete userObject.resetToken;
	delete userObject.createdAt;
	delete userObject.updatedAt;
	delete userObject.__v;

	return userObject;
};

// userSchema.methods.updateContacts = async function (sendEvent) {
// 	const user = this;
// 	await user.populate('contacts').execPopulate();
// 	for (const contact of user.contacts) {
// 		const updatedContacts = await contact.generateContactList();
// 		sendEvent(contact._id, SOCKET_EVENTS.CONTACTS_UPDATED, { updatedContacts });
// 	}
// };

// userId,
// userSchema.methods.generateContactList = async function (
// 	sendEventToRoom
// ) {
// 	const user = this;
// 	await user
// 		.populate({
// 			path: 'contacts',
// 			model: MODEL_PROPERTIES.USER.NAME,
// 		})
// 		.execPopulate();

// 	user.contacts = user.contacts.filter(
// 		(contactId) => !contactId.equals(userId)
// 	);
// 	user.contacts.unshift(userId);
// 	await user.save();
// 	await user.populate('contacts').execPopulate();

// 	sendEventToRoom(user._id, SOCKET_EVENTS.CONTACTS_UPDATED, contacts);
// };

userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.TOKEN_KEY, {
		expiresIn: '7 days',
	});
	return token;
};
//
//
//
const User = model(MODEL_PROPERTIES.USER.NAME, userSchema);

module.exports = User;
