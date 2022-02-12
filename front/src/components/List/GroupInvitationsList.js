import React, { useState, useEffect, useRef } from 'react';
import Item from '../Card/Item';
import { List } from 'semantic-ui-react';
import {
	acceptGroupInvitation,
	declineGroupInvitation,

	//   getAllUsers,
	//   getFriendRequests,
	//   getCurrentUsersFriends,
	//   acceptFriendRequest,
	//   declineFriendRequest,
	getGroupInvitations,
	getGroup,
} from '../../API';
import '../../styles/Friends.css';
function GroupInvitationsList({ checkGroup }) {
	const [items, setItems] = useState([]);
	const [skip, setSkip] = useState(0);
	const [plus, setPlus] = useState(true);
	const inputRef = useRef(null);
	const limit = 3;
	const acceptButton = {
		onClick: (id) => {
			acceptGroupInvitation(id)
				.then(({ data }) => {
					setItems(data);
				})
				.catch((err) => console.log(err));
		},
		text: 'Accept Invitation',
	};
	const declineButton = {
		onClick: (id) => {
			declineGroupInvitation(id)
				.then(({ data }) => {
					setItems(data);
				})
				.catch((err) => console.log(err));
		},
		color: '#ff5555',
		text: 'Decline Invitation',
	};

	const updateItems = async () => {
		getGroupInvitations({ limit, skip })
			.then(({ data }) => {
				if (items != null) setItems(items.concat(data));
				else setItems(data);
				if (data.length < limit) setPlus(false);
			})
			.catch((err) => console.log(err));
	};

	useEffect(() => {
		updateItems();
	}, [skip]);

	const emptyBanner = (
		<div className="link-item item empty-banner">{`You have no group invitations at the moment :( `}</div>
	);
	return (
		<>
			<List>
				{items.length
					? items.map((item) => (
							<List.Item key={item.id}>
								<Item
									onSelect={checkGroup}
									button={acceptButton}
									secondButton={declineButton}
									{...item}
								></Item>
							</List.Item>
					  ))
					: emptyBanner}
			</List>
			<div className="plusIconWrapper">
				{plus ? (
					<i
						class="big plus circle icon"
						style={{ cursor: 'pointer' }}
						onClick={() => setSkip(skip + limit)}
					></i>
				) : (
					''
				)}
			</div>
		</>
	);
}

export default GroupInvitationsList;
