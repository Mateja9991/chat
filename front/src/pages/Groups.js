import react, { useEffect, useState } from 'react';
import ListOfItems from '../components/List/ListOfItems';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { AvatarGenerator } from 'random-avatar-generator';
import '../styles/Group.css';
import Circle from '../components/Animation/Circle';
import GroupInvitationsList from '../components/List/GroupInvitationsList';
import GroupList from '../components/List/GroupList';
import { createGroup, getAllUsersGroups, getGroup } from '../API';
const generator = new AvatarGenerator();

function Groups({ setSelectedGroup }) {
	const [items, setItems] = useState([]);
	const history = useHistory();
	const [addFlag, setAddFlag] = useState(false);

	const updateItems = async () => {
		getAllUsersGroups()
			.then(({ data }) => {
				setItems(data);
			})
			.catch((err) => console.log(err));
	};
	useEffect(() => {
		updateItems();
	}, []);

	const selectGroup = (id) => {
		setSelectedGroup(id);
		history.push('/Home/Group');
	};
	const onFormSubmit = (e) => {
		const {
			target: { name, description },
		} = e;

		createGroup({ name: name.value })
			.then(({ data }) => {
				console.log('setting items');
				console.log(data);
				setItems(data);
			})
			.catch((err) => console.log(err));
		e.preventDefault();
	};
	const MakeGroupForm = () => (
		<div className="formWrapper">
			<form id="test" class="ui form" method="POST" onSubmit={onFormSubmit}>
				<div id="form-segment" class="ui center aligned attached segment">
					<div class="field">
						<div class="xWrapper">
							<i class="large x icon" onClick={() => setAddFlag(false)}></i>
						</div>
						<label for="name">Name:</label>
						<input
							type="text"
							id="name"
							name="name"
							placeholder="Enter group name..."
						/>
					</div>
					<div class="field">
						<label for="description">Description:</label>
						<input
							type="text"
							id="description"
							name="description"
							placeholder="Enter descritpion..."
						/>
					</div>
				</div>
				<button class="ui bottom attached fluid button" type="submit">
					Make a group
				</button>
			</form>
		</div>
	);

	const [requests, setRequests] = useState(true);

	const firstCircle = {
		position: 'absolute',
		top: '-50%',
		right: '-86%',
	};
	const secondCircle = {
		position: 'absolute',
		top: '85%',
		right: '130%',
		transform: 'rotate(60deg)',
	};
	const emptyBanner = (
		<div className="link-item item empty-banner">{`You have no ${
			requests ? 'friend requests' : 'friends'
		} at the moment :( `}</div>
	);
	return (
		<>
			<div className="groupsPageWrapper">
				<div className="updateForm">
					<MakeGroupForm />
				</div>
				<div className="group-separator"></div>
				<div className="friends-page-wrapper">
					<div className="friends-button-wrapper">
						<div
							onClick={() => (requests ? setRequests(false) : '')}
							className="friends friends-page-button"
						>
							<span>Groups</span>
						</div>
						<div
							onClick={() => (requests ? '' : setRequests(true))}
							set
							className="friend-requests friends-page-button"
						>
							<span> Group Inviatations </span>
						</div>
					</div>

					{requests ? (
						<GroupInvitationsList />
					) : (
						<GroupList checkGroup={selectGroup} />
					)}
					{/* <div>
						<Circle style={firstCircle} color={'#50fa7b'} />
					</div> */}
					<div>
						<Circle style={secondCircle} color={'#ff79c6'} />
					</div>
				</div>
				<div className="group-separator"></div>
			</div>
		</>
	);
}
// 			{/* <div className="makeGroupWrapper">
// 				{addFlag ? (
// 					<MakeGroupForm />
// 				) : (
// 					<button
// 						class="blue large ui basic button"
// 						onClick={() => setAddFlag(true)}
// 					>
// 						<i class="users icon"></i>
// 						Make a group
// 					</button>
// 				)}
// 			</div> */}
// 			<div className="listOfItemsWrapper">
// 				<ListOfItems
// 					itemSelected={(id) => {
// 						selectItem(id);
// 					}}
// 				>
// 					{items}
// 				</ListOfItems>
// 			</div>

// );

export default Groups;
