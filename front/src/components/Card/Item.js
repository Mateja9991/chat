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
	_id,
	name,
	onSelect,
	avatar,
	imgSrc,
	...restProps
}) {
	const ref = useRef();
	const parseKey = (key) => {
		return (key.charAt(0).toUpperCase() + key.slice(1))
			.match(/[A-Z][a-z]+/g)
			.join(' ');
	};
	let extra;
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

				<div class="content">
					<a onClick={() => onSelect(id)} class="header">
						{name}
					</a>
					{restProps
						? Object.keys(restProps).map((key) =>
								typeof key === 'string' ? (
									<div className="extra">
										<strong>{`${parseKey(key)}:`}</strong>
										{`${restProps[key]}`}
									</div>
								) : (
									''
								)
						  )
						: ''}
				</div>
				<div className="item-button-container">
					{' '}
					{text ? (
						<Button
							id={id}
							icon={icon}
							onClick={(id) => {
								onClick(id);
							}}
							color={color}
							text={text}
						/>
					) : (
						<div className="button-component" style={{ visibility: 'hidden' }}>
							{[...new Array(20)].map((el) => 'a').join('')}
						</div>
					)}
					{secText ? (
						<Button
							id={id}
							icon={secIcon}
							onClick={(id) => {
								secOnClick(id);
							}}
							color={secColor}
							text={secText}
						/>
					) : (
						''
					)}
				</div>
			</div>
		</div>
	);
}

export default Item;
