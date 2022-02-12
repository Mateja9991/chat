const SOCKET_EVENTS = {
	NEW_MESSAGE: 'new-message',
	NEW_NOTIFICATION: 'new-notification',
	CONTACTS_UPDATED: 'contacts-updated',
	CHECK_CONNECTION: 'check-connection',
	USER_STATUS_CHANGED: 'user-status-changed',
	USER_STARTED_TYPING: 'user-started-typing',
	USER_STOPPED_TYPING: 'user-stopped-typing',
	USER_UNSENT_MESSAGE: 'user-unsent-message',
	USER_SEEN_MESSAGE: 'user-seen-message',
};

module.exports = {
	SOCKET_EVENTS,
};
