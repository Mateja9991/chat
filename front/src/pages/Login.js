import React, { useState, useContext } from 'react';
import { loginAsUser } from '../API/Users';
import '../styles/Login.css';
import { url } from '../constants/constants.js';
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import Circle from '../components/Animation/Circle';
function Login({ setStorage }) {
	//const [user, setUser] = useContext(UserContext);
	const [id, setId] = useState(null);
	const [password, setPassword] = useState(null);
	const history = useHistory();

	const submitLogin = async (e) => {
		e.preventDefault();
		const {
			data: { user, token },
		} = await loginAsUser({
			id,
			password,
		});
		if (token) {
			if (user.avatar) user.avatar = user.avatar.picture;
			setStorage({ ...user, token });
			// if (user.role == 'Customer') history.push('/Home/Restaurants');
			// else if (user.role == 'Restaurant') history.push('/Home/Menu');
			// else if (user.role == 'RestaurantInstance') history.push('/Home/Orders');
			history.push('/Home');
		}
	};
	const registerButton = {
		backgroundColor: '#bd93f9',
	};
	const loginButton = {
		backgroundColor: '#6272a4',
	};
	const firstCircle = {
		position: 'absolute',
		top: '-40%',
		right: '-50%',
	};
	const secondCircle = {
		position: 'absolute',
		top: '35%',
		right: '50%',
		transform: 'rotate(60deg)',
	};
	return (
		<div className="pageWrapper">
			<div>
				<Circle style={firstCircle} color={'#50fa7b'} />
			</div>
			<div>
				<Circle style={secondCircle} color={'#ff79c6'} />
			</div>

			<div class="page-login front-window">
				<div class="ui centered grid container">
					<div class="nine wide column">
						<div class="ui fluid card">
							<div class="content">
								<form class="ui form">
									<div class="field">
										<label>User</label>
										<input
											type="text"
											name="user"
											placeholder="User"
											onChange={(e) => setId(e.target.value)}
										/>
									</div>
									<div class="field">
										<label>Password</label>
										<input
											type="password"
											name="pass"
											placeholder="Password"
											onChange={(e) => setPassword(e.target.value)}
										/>
									</div>
									<div className="buttons">
										<button
											style={loginButton}
											class="ui primary labeled icon button"
											onClick={submitLogin}
										>
											<i class="unlock alternate icon"></i>
											Login
										</button>
										<Link to="/Register">
											<button
												type="button"
												style={registerButton}
												class="ui button"
											>
												Register
											</button>
										</Link>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Login;
