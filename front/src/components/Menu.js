import react, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Menu.css';
import '../styles/Animation.css';
import { useSocket } from '../context/socketProvider';
import SOCKET_EVENTS from '../constants/socket_events';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

function Menu({ setSearchTerm }) {
	const inputRef = useRef(null);
	const [contactsClicked, setContactsClicked] = useState(false);
	let history = useHistory();
	let searchTimer;
	const logOutHandler = () => {
		// if (socket) socket.emit('logout');
		// console.log('CLEARING STORAGE');
		localStorage.clear();
	};

	return (
		<>
			<div class="ui pointing menu">
				<Link class="link-item" to="/Home/Chat">
					<a class="item" onClick={() => {}}>
						Contacts
					</a>
				</Link>
				<Link class="link-item" to="/Home/Profile">
					<a class="item">Profile</a>
				</Link>
				<Link class="link-item" to="/Home/Groups">
					<a class="item">Groups</a>
				</Link>
				<Link class="link-item" to="/Home/Friends">
					<a class="item">Friends</a>
				</Link>
				<a className="menu-separator"></a>
				<div class="right menu">
					<div class="item">
						<div class="ui transparent icon input">
							<input
								ref={inputRef}
								type="text"
								placeholder="Search Users..."
								onChange={(e) => {
									if (searchTimer) clearTimeout(searchTimer);
									inputRef.current.value = e.target.value;
									searchTimer = setTimeout(() => {
										const searchTerm = inputRef.current.value
											? inputRef.current.value
											: '';
										history.push('/Home/Users');
										setSearchTerm(searchTerm);
									}, 2000);
								}}
								onKeyPress={(e) => {
									if (e.code !== 'Enter') return;
									if (searchTimer) clearTimeout(searchTimer);
									const searchTerm = inputRef.current.value
										? inputRef.current.value
										: '';
									history.push('/Home/Users');

									setSearchTerm(searchTerm);
								}}
							/>
							<i class="search link icon"></i>
						</div>
					</div>
				</div>
			</div>
			<div className="logOutBtn">
				<Link to="/">
					<button class="ui button" onClick={logOutHandler}>
						<strong>Log out</strong>
					</button>
				</Link>
			</div>
		</>
	);
}

export default Menu;
