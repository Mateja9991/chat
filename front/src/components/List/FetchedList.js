import React, { useState, useContext, useEffect } from 'react';
import ListOfItems from './ListOfItems';

function FetchedList({
	user: { role, ...user },
	itemSelected,
	fetchItems,
	mapItem,
	button,
}) {
	const [items, setItems] = useState([]);
	const updateItems = async () => {
		fetchItems()
			.then(({ data }) => {
				setItems(data.map((el, ind) => (mapItem ? mapItem(el, ind) : el)));
			})
			.catch((err) => console.log(err));
	};

	useEffect(() => {
		if (button && button.onClick) {
			button.onClick = button.onClick.bind(null, async () => {
				updateItems();
			});
		}
		updateItems();
	}, []);

	return (
		<ListOfItems button={button} itemSelected={itemSelected}>
			{items}
		</ListOfItems>
	);
}

export default FetchedList;
