import { url } from '../../constants/constants';
import axios from 'axios';
import { token } from '../utils';

const getPrivateSession = async (userId) =>
	axios.get(`${url}/sessions/me/users/${userId}`, {
		headers: { Authorization: `Bearer ${token()}` },
	});
const getGroupSession = async (groupId) =>
	axios.get(`${url}/sessions/groups/${groupId}`, {
		headers: { Authorization: `Bearer ${token()}` },
	});

const getContentFromSession = async (
	sessionId,
	contentType,
	{ limit, skip } = { limit: 3, skip: 0 }
) =>
	axios.get(`${url}/sessions/${sessionId}/content/${contentType}`, {
		headers: {
			Authorization: `Bearer ${token()}`,
		},
		params: {
			limit,
			skip,
		},
	});
const searchMessageHistory = async (
	sessionId,
	searchTerm,
	skip,
	totalNumReq = false
) =>
	axios.get(`${url}/sessions/${sessionId}/search`, {
		headers: {
			Authorization: `Bearer ${token()}`,
		},
		params: {
			searchTerm,
			skip,
			totalNumReq,
		},
	});
export {
	getPrivateSession,
	getGroupSession,
	getContentFromSession,
	searchMessageHistory,
};
