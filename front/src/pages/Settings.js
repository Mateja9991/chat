import react, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/navBar.css';
import { updateCurrentUser, deleteCurrentUser, uploadPicture } from '../API';
import useStorage from '../common/storage';

function Settings({ user, role, setAvatar, setCurrentUser }) {
	const { storage, setStorage } = useStorage();
	const [popupFlag, setPopupFlag] = useState(false);

	const onSubmitUpdate = async (event) => {
		event.preventDefault();
		const {
			target: { name, email, password, oldPassword, file },
		} = event;
		//console.log(name, email, file, password);
		if (
			name.value ||
			email.value ||
			password.value ||
			oldPassword.value ||
			(file && file.value)
		) {
			var updates = {};
			const formData = new FormData();

			if (name.value != '') {
				updates.name = name.value;
				formData.append('name', name.value);
			}
			if (email.value != '') {
				updates.email = email.value;
				formData.append('email', email.value);
			}
			if (password.value != '') {
				formData.append('password', password.value);
				updates.password = password.value;
			}
			if (oldPassword.value != '') {
				formData.append('password', password.value);
				updates.oldPassword = oldPassword.value;
			}
			if (file && file.value) {
				const pictureFormData = new FormData();
				pictureFormData.append('profileImg', file.files[0]);
				pictureFormData.append('setProfilePicture', true);
				uploadPicture(pictureFormData)
					.then(({ data }) => {
						localStorage.setItem('avatar', data.picture);

						setCurrentUser({
							...user,
							avatar: data,
						});
					})
					.catch((err) => console.log(err));
			}
			updateCurrentUser(updates)
				.then(({ data }) => {
					console.log(data);
					setCurrentUser({ ...data, avatar: user.avatar });
				})
				.catch((err) => console.log(err));
		} else alert('Morate uneti bar jedan podatak za azuriranje.');
	};

	const onDeleteUser = async () => {
		const response = await deleteCurrentUser();
		localStorage.clear();
	};

	const popupForm = () => {
		return (
			<div className="popup-container">
				<div className="popupWrapper">
					<div class="ui card">
						<div class="content">
							<div className="headerWrapper">Are you sure?</div>
						</div>
						<div class="ui two bottom attached buttons">
							<div
								class="ui button"
								onClick={() => {
									setPopupFlag(false);
								}}
							>
								No
							</div>
							<div class="ui red button" onClick={onDeleteUser}>
								Yes
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="formWrapper">
			<form id="test" class="ui form" method="PATCH" onSubmit={onSubmitUpdate}>
				<h4 class="ui center aligned top attached header">
					Make changes to your profile.
				</h4>
				<div id="form-segment" class="ui center aligned attached segment">
					<div class="field">
						<label for="email">Name:</label>
						<input
							type="text"
							id="name"
							name="name"
							placeholder={user.username}
						/>
					</div>
					<div class="field">
						<label for="email">E-mail:</label>
						<input
							type="email"
							id="email"
							name="email"
							placeholder={user.email}
						/>
					</div>
					<div class="field">
						<label for="password">Password:</label>
						<input
							type="password"
							id="oldPassword"
							name="oldPpassword"
							placeholder="••••••••"
						/>
					</div>
					<div class="field">
						<label for="password">New Password:</label>
						<input
							type="password"
							id="password"
							name="password"
							placeholder="••••••••"
						/>
					</div>
					<div class="field">
						<input
							name="file"
							type="file"
							onChange={(e) => {
								console.log(e.target.files);
							}}
						/>
					</div>
				</div>
				<button class="ui bottom attached fluid button" type="submit">
					Update
				</button>
			</form>
			{popupFlag ? popupForm() : ''}
			<button
				class="red ui bottom attached fluid button"
				onClick={() => {
					if (!popupFlag) setPopupFlag(true);
				}}
			>
				Delete Profile
			</button>
		</div>
	);
}

export default Settings;

/*
Note : Treba da se Yes popup forme wrappuje Linkom, ka "/"
*/
