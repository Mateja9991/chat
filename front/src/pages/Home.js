import react from 'react';
import Menu from '../components/Menu';
import { useEffect, useState } from 'react';
import { SocketProvider, useSocket } from '../context/socketProvider';
import { useHistory, Switch, Route } from 'react-router-dom';
import '../styles/navBar.css';

function HomePage({ user: { role, ...user } }) {
	return (
		<>
			<div>Welcome To Home Page</div>
		</>
	);
}

export default HomePage;
