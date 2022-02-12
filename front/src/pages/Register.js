import React, { useState, useContext } from 'react';
import axios from 'axios';
import { url } from '../constants/constants.js';
import { Link } from 'react-router-dom';
import Circle from '../components/Animation/Circle.js';
import '../styles/button.css';
function Register({ setToken, setUser, onSubmitRegister }) {
	const registerButton = {
		backgroundColor: '#8be9fd',
		outline: '1px solid #8be9fd',
	};

	const firstCircle = {
		position: 'absolute',
		top: '-40%',
		right: '-35%',
	};
	const secondCircle = {
		position: 'absolute',
		top: '40%',
		right: '35%',
		transform: 'rotate(60deg)',
	};

	return (
		<div className="pageWrapper">
			<div>
				<Circle style={firstCircle} color={'#bd93f9'} />
			</div>
			<div>
				<Circle style={secondCircle} color={'#f1fa8c'} />
			</div>

			<div className="front-window">
				<form
					id="test"
					class="ui form"
					method="POST"
					onSubmit={onSubmitRegister}
				>
					<h4 class="ui center aligned top attached header">
						Please enter your credentials
					</h4>
					<div id="form-segment" class="ui center aligned attached segment">
						<div class="field">
							<label for="username">Username:</label>
							<input
								type="text"
								id="username"
								name="username"
								placeholder="Enter username..."
							/>
						</div>
						<div class="field">
							<label for="username">Name(optional):</label>
							<input
								type="text"
								id="name"
								name="name"
								placeholder="Enter name..."
							/>
						</div>
						<div class="field">
							<label for="email">E-mail:</label>
							<input
								type="email"
								id="email"
								name="email"
								placeholder="Enter email..."
							/>
						</div>
						<div class="field">
							<label for="password">Password:</label>
							<input
								type="password"
								id="password"
								name="password"
								placeholder="••••••••"
							/>
						</div>
					</div>
					<div id="form-message" class="ui attached message">
						<i class="icon help"></i>
						Already registered? Please login
						<Link to="/">
							<a href="#"> here</a>.
						</Link>
					</div>
					<button
						style={registerButton}
						class="ui bottom attached fluid button"
						type="submit"
					>
						Register
					</button>
				</form>
			</div>
		</div>
	);
}

export default Register;
