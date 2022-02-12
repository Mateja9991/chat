import React, { useState, useContext, useEffect, useRef } from 'react';
import { ListOfItems } from '../components/List';
import Item from '../components/Card/Item';
import { List } from 'semantic-ui-react';
import { getAllUsers, sendFriendRequest } from '../API';
import Circle from '../components/Animation/Circle';

function SearchUsers({ checkUser, searchTerm, button }) {
	const [items, setItems] = useState([]);
	const [skip, setSkip] = useState(0);
	const [plus, setPlus] = useState(true);
	const inputRef = useRef(null);
	const limit = 3;
	const updateItems = async () => {
		getAllUsers({ limit, skip, searchTerm: 'username', username: searchTerm })
			.then(({ data }) => {
				if (items != null) setItems(items.concat(data));
				else setItems(data);
				if (data.length < limit) setPlus(false);
			})
			.catch((err) => console.log(err));
	};
	useEffect(() => {
		updateItems();
	}, [skip, searchTerm]);
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
	return (
		<>
			<List>
				{items.map((item) => (
					<List.Item key={item.id}>
						<Item
							onSelect={checkUser}
							button={button}
							name={item.username ? item.username : item.name}
							{...item}
						></Item>
					</List.Item>
				))}
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
				<div>
					<Circle style={firstCircle} color={'#50fa7b'} />
				</div>
				<div>
					<Circle style={secondCircle} color={'#ff79c6'} />
				</div>
			</div>
		</>
	);
}

export default SearchUsers;
