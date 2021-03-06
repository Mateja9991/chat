const express = require('express');
const path = require('path');
const { errorHandler } = require('./utils');
const router = new express.Router();

router.use(function (req, res, next) {
	res.header('Access-Control-Allow-Headers', '*');
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Credentials', true);
	res.header(
		'Access-Control-Allow-Methods',
		'GET, POST, PATCH, DELETE, OPTIONS'
	);
	next();
});

router.use(require('./user.router'));
router.use(require('./session.router'));
router.use(require('./user.router'));
router.use(require('./avatar.router'));
router.use(require('./group.router'));
router.use(require('./message.router'));

// router.use(require('./note.router'));
// router.use(require('./comment.router'));

router.use(errorHandler);

module.exports = router;
