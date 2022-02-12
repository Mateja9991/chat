import react, { useEffect } from 'react';
import { useState } from 'react';
import { url } from '../constants/constants.js';
import '../styles/Profile.css';
import { AvatarGenerator } from 'random-avatar-generator';
import Settings from './Settings';
import { getCurrentUser } from '../API/index.js';
const generator = new AvatarGenerator();

function Profile({ user, role }) {
	// const getStorage = () => {
	// 	let keys = localStorage.getItem('user_keys');
	// 	keys = keys ? JSON.parse(keys) : [];
	// 	return keys.reduce(
	// 		(obj, key) => (obj[key] = localStorage.getItem(key)) && obj,
	// 		{}
	// 	);
	// };
	const [currentUser, setCurrentUser] = useState();
	const [userAvatar, setUserAvatar] = useState();
	useEffect(() => {
		if (currentUser && currentUser.avatar) {
			console.log(currentUser);
			setUserAvatar(currentUser.avatar.picture);
		}
	}, [currentUser]);
	console.log('MOUNTED PROFILE');

	useEffect(() => {
		console.log('MOUNTED PROFILE');
		getCurrentUser()
			.then(({ data }) => {
				setCurrentUser(data);
			})
			.catch((err) => console.log(err));
	}, [user]);
	const userLabel = (
		<div className="user-label-wrapper">
			<div className="avatar-wrapper label">
				<img
					className="avatar"
					src={
						userAvatar
							? `data:image/png;base64, ${userAvatar}`
							: `${url}/img/nopic.jpg`
					}
				/>
			</div>
			<div className="username-wrapper label">
				{currentUser ? currentUser.username : ''}
			</div>
			<div style={{ visibility: 'hidden' }}>
				<img
					className="avatar"
					src={
						userAvatar
							? `data:image/png;base64, ${userAvatar}`
							: `${url}/img/nopic.jpg`
					}
				/>
			</div>
		</div>
	);

	return (
		<div className="profileWrapper">
			<div className="userLabelWrapper">
				<div className="char-user-label">
					{currentUser != null ? userLabel : ''}
				</div>
			</div>
			<div className="settingsWrapper">
				{currentUser ? (
					<Settings user={currentUser} setCurrentUser={setCurrentUser} />
				) : (
					''
				)}
			</div>
		</div>
	);
}

export default Profile;
