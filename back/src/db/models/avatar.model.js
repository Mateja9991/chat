const { Schema, model } = require('mongoose');
const { MODEL_PROPERTIES } = require('../../constants');
const sharp = require('sharp');

//
//              Schema
//
const avatarSchema = new Schema({
	// name: {
	// 	type: String,
	// 	unique: true,
	// 	required: true,
	// 	trim: true,
	// },
	picture: {
		type: String,
		required: true,
	},
	small: {
		type: String,
	},
});
//
//
//
avatarSchema.statics.generateBase64 = function (buff) {
	var binary = '';
	var bytes = new Uint8Array(buff);
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return Buffer.from(binary, 'binary').toString('base64');
};

avatarSchema.pre('save', async function (next) {
	if (this.isModified('picture')) {
		await this.resizeToSmall();
	}
	next();
});

avatarSchema.methods.resizeToSmall = async function () {
	const avatarBuffer = await sharp(
		Buffer.from(this.picture.split(';base64,').pop(), 'base64')
	)
		.resize({ width: 30, height: 30 })
		.png()
		.toBuffer();
	const base64 = Avatar.generateBase64(avatarBuffer);
	this.small = base64;
};

avatarSchema.methods.toJSON = function () {
	const avatar = this;
	const avatarObject = avatar.toObject();
	return avatarObject;
};

const Avatar = model(MODEL_PROPERTIES.AVATAR.NAME, avatarSchema);

module.exports = Avatar;
