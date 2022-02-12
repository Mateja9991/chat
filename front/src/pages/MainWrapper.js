import react from 'react';
import Menu from '../components/Menu';
import { useEffect, useState } from 'react';
import HomePage from './Home';
import Chat from './Chat/Chat';
import Settings from './Settings';
import UsersPage from './Users';
import FriendsPage from './Friends';
import Groups from './Groups';
import Group from './Group';
import Profile from './Profile';

import { SocketProvider, useSocket } from '../context/socketProvider';
import { useHistory, Switch, Route } from 'react-router-dom';
import '../styles/navBar.css';

function MainWrapper({ user: { role, ...user } }) {
	let history = useHistory();
	const [selGroup, setSelGroup] = useState(null);
	const [groupMembers, setGroupMembers] = useState(null);
	// const HomeWrapper = () => <HomePage user={user} />;
	const [searchTerm, setSearchTerm] = useState('');
	const ChatWrapper = () => <Chat user={user} role={role} />;
	const UsersPageWrapper = () => (
		<UsersPage
			searchTerm={searchTerm}
			group={groupMembers}
			setGroup={setGroupMembers}
		/>
	);
	const FriendsPageWrapper = () => <FriendsPage />;
	const ProfileWrapper = () => <Profile user={user} role={role} />;
	const GroupWrapper = () => (
		<Group id={selGroup} setGroupMembers={setGroupMembers} />
	);
	const GroupsWrapper = () => (
		<Groups user={user} setSelectedGroup={setSelGroup} />
	);
	console.log('IN HOME');
	return (
		<SocketProvider>
			<div className="outter">
				<div className="navBar">
					<Menu setSearchTerm={setSearchTerm} />
				</div>
				<div className="pageWrapper">
					<Switch>
						<Route path="/Home/Chat" exact component={ChatWrapper} />
						<Route path="/Home/Users" exact component={UsersPageWrapper} />
						<Route path="/Home/Friends" exact component={FriendsPageWrapper} />

						{/* <Route path="/Home" exact component={HomeWrapper} /> */}
						<Route
							path="/Home/Profile"
							exact
							component={ProfileWrapper}
						></Route>
						<Route path="/Home/Groups" exact component={GroupsWrapper}></Route>
						<Route path="/Home/Group" exact component={GroupWrapper}></Route>
					</Switch>
				</div>
			</div>
		</SocketProvider>
	);
}

export default MainWrapper;
