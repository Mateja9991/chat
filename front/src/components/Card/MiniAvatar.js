import React, { useState, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { RestaurantMenuPage } from '../../pages';
import { Button } from '../Button';
import { url } from '../../constants/constants';
import { AvatarGenerator } from 'random-avatar-generator';

const generator = new AvatarGenerator();
function Item({
	button: { icon, onClick, text, color: color } = {},
	secondButton: {
		icon: secIcon,
		onClick: secOnClick,
		text: secText,
		color: secColor,
	} = {},
	id,
	name,
	onSelect,
	avatar,
	imgSrc,
	...restProps
}) {
	console.log(restProps);
	console.log('props');
	console.log(secOnClick, secText);
	const ref = useRef();
	const parseKey = (key) => {
		return (key.charAt(0).toUpperCase() + key.slice(1))
			.match(/[A-Z][a-z]+/g)
			.join(' ');
	};
	let extra;
	console.log(`${imgSrc} imgsrc`);
	// if (address) extra = address;
	// else if (price) extra = price;
	return (
		<div key={id} className={'ui items'}>
			<div className="item">
				<div className="avatar-wrapper">
					<img
						className="item-avatar"
						resizeMode="contain"
						src={
							avatar
								? `data:image/png;base64, ${avatar.picture}`
								: `${url}/img/nopic.jpg`
						}
						onError={({ currentTarget }) => {
							currentTarget.onerror = null;
						}}
					/>
				</div>
			</div>
		</div>
	);
}

export default Item;
