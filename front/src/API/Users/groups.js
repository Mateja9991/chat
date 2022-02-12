import { url } from '../../constants/constants';
import axios from 'axios';
import { token } from '../utils';

const acceptGroupInvitation = (groupId) =>
	axios.patch(
		`${url}/users/me/accept-group-invitation`,
		{ groupId },
		{ headers: { Authorization: `Bearer ${token()}` } }
	);
const declineGroupInvitation = (groupId) =>
	axios.patch(
		`${url}/users/me/decline-group-invitation`,
		{ groupId },
		{ headers: { Authorization: `Bearer ${token()}` } }
	);
const sendGroupInvitation = async (groupId, userId) =>
	axios.patch(
		`${url}/users/send-group-invitation`,
		{ userId, groupId },
		{ headers: { Authorization: `Bearer ${token()}` } }
	);
const leaveGroup = (groupId) =>
	axios.patch(
		`${url}/users/me/leave-group`,
		{ groupId },
		{ headers: { Authorization: `Bearer ${token()}` } }
	);
const getGroupInvitations = ({ limit, skip }) =>
	axios.get(`${url}/users/me/invitations`, {
		headers: { Authorization: `Bearer ${token()}` },
		params: { limit, skip },
	});
const removeUserFromGroup = (groupId, userId) =>
	axios.patch(
		`${url}/users/remove-from-group`,
		{ groupId, userId },
		{
			headers: { Authorization: `Bearer ${token()}` },
		}
	);
export {
	acceptGroupInvitation,
	declineGroupInvitation,
	sendGroupInvitation,
	getGroupInvitations,
	leaveGroup,
	removeUserFromGroup,
};
