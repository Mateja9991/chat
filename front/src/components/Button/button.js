import React, { useState, useContext } from 'react';

function Button({ id, icon, onClick, text, color }) {
	return (
		<div class="button-component">
			<div onClick={({ target: { id } }) => onClick(id)}>
				<button
					id={id}
					class="ui button"
					style={{
						color: color ? 'white' : '',
						backgroundColor: color,
					}}
				>
					{text}
				</button>
			</div>
		</div>
	);
}

export default Button;
