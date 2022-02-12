import React, { useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { url } from '../constants/constants';
import SOCKET_EVENTS from '../constants/socket_events';
const SocketContext = React.createContext();

export function useSocket() {
	return useContext(SocketContext);
}

export function SocketProvider({ children }) {
	const [socket, setSocket] = useState();
	const token = localStorage.getItem('token');
	useEffect(() => {
		console.log('CREATING NEW SOCKET');
		const newSocket = io.connect(url, {
			transports: ['websocket'], // https://stackoverflow.com/a/52180905/8987128
			upgrade: false,
			auth: {
				token: token,
			},
		});
		console.log('check 1', newSocket.connected);

		newSocket.on('connect', function () {
			console.log('check 2', newSocket.connected);
		});

		setSocket(newSocket);
		return () => {
			console.log('CLOSING THE SOCKET');
			newSocket.off();
			newSocket.disconnect();
		};
	}, []);
	useEffect(() => {
		if (socket) {
			const link =
				'https://proxy.notificationsounds.com/message-tones/all-eyes-on-me-465/download/file-sounds-954-all-eyes-on-me.mp3';
			const audio = new Audio(link);
			socket.on('new-message', () => {
				audio.play();
			});
		}
		if (!socket) return;
		const eventsToHandle = ['restaurants-unavailable', 'carriers-unavailable'];
		eventsToHandle.forEach((event) => {
			socket.off(event);
			socket.on(event, () => alert(event));
		});
		if (socket) {
			socket.off('check-connection');
			socket.on('check-connection', () => {
				console.log('pinged');
				socket.emit('keepAlive');
			});
		}
		// let intervalId = setInterval(() => {
		// 	console.log('who am i?');
		// 	if (socket) {
		// 		socket.emit('keepAlive', localStorage.getItem('id'));
		// 	}
		// }, 3000);
		// return () => {
		// 	clearInterval(intervalId);
		// };
	}, [socket]);
	return (
		<SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
	);
}
