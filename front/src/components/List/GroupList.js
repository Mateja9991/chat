import React, { useState, useEffect, useRef } from 'react';
import Item from '../Card/Item';
import { List } from 'semantic-ui-react';
import { getAllUsersGroups, removeFriend, leaveGroup } from '../../API';
import '../../styles/Friends.css';
function GroupList({ checkGroup }) {
	const [items, setItems] = useState([]);
	const [skip, setSkip] = useState(0);
	const [plus, setPlus] = useState(true);
	const inputRef = useRef(null);
	const limit = 2;

	const removeButton = {
		onClick: (id) => {
			leaveGroup(id)
				.then(({ data }) => {
					setItems(data);
				})
				.catch((err) => console.log(err));
		},
		text: 'Leave Group',
	};

	const updateItems = async () => {
		getAllUsersGroups({ limit, skip })
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
		<div className="link-item item empty-banner">{`You have no groups at the moment :( `}</div>
	);
	return (
		<>
			<List>
				{items.length
					? items.map((item) => (
							<List.Item key={item.id}>
								<Item
									onSelect={checkGroup}
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

export default GroupList;
