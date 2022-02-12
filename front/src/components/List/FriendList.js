import React, { useState, useEffect, useRef } from 'react';
import Item from '../Card/Item';
import { List } from 'semantic-ui-react';
import { getCurrentUsersFriends, removeFriend } from '../../API';
import '../../styles/Friends.css';
function FriendList({ checkUser }) {
	const [items, setItems] = useState([]);
	const [skip, setSkip] = useState(0);
	const [plus, setPlus] = useState(true);
	const inputRef = useRef(null);
	const limit = 2;

	const removeButton = {
		onClick: (id) => {
			removeFriend(id)
				.then(({ data }) => {
					console.log(data);
					setItems(data);
				})
				.catch((err) => console.log(err));
		},
		text: 'Remove Friend',
	};

	const updateItems = async () => {
		getCurrentUsersFriends({ limit, skip })
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
		<div className="link-item item empty-banner">{`You have no friends at the moment :( `}</div>
	);
	return (
		<>
			<List>
				{items.length
					? items.map((item) => (
							<List.Item key={item.id}>
								<Item
									onSelect={checkUser}
									button={removeButton}
									{...item}
								></Item>
							</List.Item>
					  ))
					: emptyBanner}
			</List>
			<div className="plusIconWrapper">
				{plus ? (
					<i
						class="big plus icon invert"
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

export default FriendList;
