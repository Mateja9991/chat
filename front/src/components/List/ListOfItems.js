import React, { useState, useContext } from 'react';
import { ItemMeta, List } from 'semantic-ui-react';
import Item from '../Card/Item';
import { Link } from 'react-router-dom';

function ListOfItems({ button, children: items, itemSelected }) {
	return (
		<List>
			{items.map((item) => (
				<List.Item key={item.id}>
					<Item onSelect={itemSelected} button={button} {...item}></Item>
				</List.Item>
			))}
		</List>
	);
}

export default ListOfItems;
