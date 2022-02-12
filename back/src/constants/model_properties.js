const MODEL_PROPERTIES = {
	USER: {
		NAME: 'User',
		ALLOWED_KEYS: {
			CREATE: ['username', 'email', 'password'],
			UPDATE: ['username', 'email', 'password', 'settings'],
			SETTINGS: ['defaultView', 'projectView', 'theme'],
		},
		SELECT_FIELDS: 'username email lastActiveAt avatar id _id',
	},
	GROUP: {
		NAME: 'Group',
		ALLOWED_KEYS: {
			CREATE: ['name', 'description'],
			UPDATE: ['name', 'description', 'adminIds'],
		},
		SELECT_FIELDS: 'name id _id',
	},
	MESSAGE: {
		NAME: 'Message',
		ALLOWED_KEYS: {
			CREATE: [],
			UPDATE: [],
		},
		SELECT_FIELDS: 'createdAt text _id id deletedBy seenBy from sessionId',
	},
	SESSION: {
		NAME: 'Session',
		ALLOWED_KEYS: {
			CREATE: [],
			UPDATE: [],
		},
		SELECT_FIELDS: '',
	},
	AVATAR: {
		NAME: 'Avatar',
		ALLOWED_KEYS: {
			CREATE: ['name'],
			UPDATE: ['name'],
		},
		SELECT_FIELDS: ' _id name picture id ',
	},
	COUNTER: {
		NAME: 'Counter',
	},
};

module.exports = {
	MODEL_PROPERTIES,
};
