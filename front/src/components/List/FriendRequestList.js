import React, { useState, useEffect, useRef } from 'react';
import Item from '../Card/Item';
import { List } from 'semantic-ui-react';
import {
	getAllUsers,
	getFriendRequests,
	getCurrentUsersFriends,
	acceptFriendRequest,
	declineFriendRequest,
} from '../../API';
import '../../styles/Friends.css';
function FriendRequestList({ checkUser }) {
	const [items, setItems] = useState([]);
	const [skip, setSkip] = useState(0);
	const [plus, setPlus] = useState(true);
	const inputRef = useRef(null);
	const limit = 3;
	const acceptButton = {
		onClick: (id) => {
			acceptFriendRequest(id)
				.then(({ data }) => {
					setItems(data);
				})
				.catch((err) => console.log(err));
		},
		text: 'Accept Request',
	};
	const declineButton = {
		onClick: (id) => {
			declineFriendRequest(id)
				.then(({ data }) => {
					setItems(data);
				})
				.catch((err) => console.log(err));
		},
		color: '#ff5555',
		text: 'Decline Request',
	};

	const updateItems = async () => {
		getFriendRequests({ limit, skip })
			.then(({ data }) => {
				if (items != null) setItems(items.concat(data));
				else setItems(data);
				if (data.length < limit) setPlus(false);
			})
			.catch((err) => console.log(err));
		console.log('setting items ');
	};

	useEffect(() => {
		updateItems();
	}, [skip]);

	const emptyBanner = (
		<div className="link-item item empty-banner">{`You have no friend requests at the moment :( `}</div>
	);
	return (
		<>
			<List>
				{items.length
					? items.map((item) => (
							<List.Item key={item.id}>
								<Item
									onSelect={checkUser}
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

export default FriendRequestList;
