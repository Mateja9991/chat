import { url } from '../../constants/constants';
import axios from 'axios';
import { token } from '../utils';

const getCurrentUsersFriends = async ({ limit, skip }) =>
	axios.get(`${url}/users/me/friends`, {
		headers: { Authorization: `Bearer ${token()}` },
		params: { limit, skip },
	});
const getFriendRequests = async () =>
	axios.get(`${url}/users/me/friend-requests`, {
		headers: { Authorization: `Bearer ${token()}` },
	});
const sendFriendRequest = async (userId) =>
	axios.patch(
		`${url}/users/send-friend-request`,
		{ userId },
		{
			headers: { Authorization: `Bearer ${token()}` },
		}
	);
const acceptFriendRequest = async (userId) =>
	axios.patch(
		`${url}/users/accept-friend-request`,
		{ userId },
		{
			headers: { Authorization: `Bearer ${token()}` },
		}
	);
const declineFriendRequest = async (userId) =>
	axios.patch(
		`${url}/users/decline-friend-request`,
		{ userId },
		{
			headers: { Authorization: `Bearer ${token()}` },
		}
	);
const removeFriend = async (userId) =>
	axios.patch(
		`${url}/users/remove-friend`,
		{ userId },
		{
			headers: { Authorization: `Bearer ${token()}` },
		}
	);

export {
	getCurrentUsersFriends,
	getFriendRequests,
	sendFriendRequest,
	acceptFriendRequest,
	declineFriendRequest,
	removeFriend,
};
