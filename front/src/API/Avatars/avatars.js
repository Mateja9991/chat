import { url } from '../../constants/constants';
import axios from 'axios';
import { token } from '../utils';

const uploadPicture = (formData) =>
	axios.post(`${url}/avatars`, formData, {
		headers: { Authorization: `Bearer ${token()}` },
	});

// const getAllAvatars = (groupId) =>
// 	axios.get(
// 		`${url}/avatars`,
// 		{ headers: { Authorization: `Bearer ${token()}` } }
// 	);
const getPicture = async (avatarId) =>
	axios.get(`${url}/avatars/${avatarId}`, {
		headers: { Authorization: `Bearer ${token()}` },
	});
const deletePicture = (avatarId) =>
	axios.delete(`${url}/avatars/${avatarId}`, {
		headers: { Authorization: `Bearer ${token()}` },
	});

export { uploadPicture, getPicture, deletePicture };
