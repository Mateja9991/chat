import { url } from '../../constants/constants';
import axios from 'axios';
import { token } from '../utils';

// const createGroup = async (group) =>
// 	axios.post(`${url}/groups`, group, {
// 		headers: { Authorization: `Bearer ${token()}` },
// 	});
//     const getAllUsersGroups = () =>
// 	axios.get(`${url}/groups/me`, {
// 		headers: { Authorization: `Bearer ${token()}` },
// 	});

// const updateGroup = async (groupId, group) =>
// 	axios.patch(`${url}/groups/${groupId}`, group, {
// 		headers: { Authorization: `Bearer ${token()}` },
// 	});

// const deleteGroup = (groupId) =>
// 	axios.delete(`${url}/groups/${groupId}`, {
// 		headers: { Authorization: `Bearer ${token()}` },
// 	});
const getGroupMembers = async (groupId) =>
	axios.get(`${url}/groups/${groupId}/members`, {
		headers: { Authorization: `Bearer ${token()}` },
	});

const removeGroupMember = async (userId) =>
	axios.patch(`${url}/groups//members`, {
		headers: { Authorization: `Bearer ${token()}` },
	});
export { getGroupMembers };
