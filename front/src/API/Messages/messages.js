import { url } from '../../constants/constants';
import axios from 'axios';
import { token } from '../utils';

const deleteMessage = async (messageId) =>
	axios.patch(
		`${url}/messages/${messageId}`,
		{},
		{
			headers: { Authorization: `Bearer ${token()}` },
		}
	);

export { deleteMessage };
