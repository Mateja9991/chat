import react, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/navBar.css';
import {
	getCarrierCurrentDeliveries,
	getCarrierPendingDeliveries,
	getCustomerCurrentDeliveries,
	getInstanceCurrentOrders,
	getInstancePendingOrders,
} from '../API';
import { useSocket } from '../context/socketProvider';
import SOCKET_EVENTS from '../constants/socket_events';
const setSocketNavbarEvents = (socket, role) => {};

function NavBar({ role, newReqNum }) {
	const socket = useSocket();
	const [deliveryStartedNotifNum, setDeliveryStartedNotifNum] = useState(0);
	const [restMadeOrderNotifNum, setRestMadeOrderNotifNum] = useState(0);
	const [carrierAcceptedNotifNum, setCarrierAcceptedNotifNum] = useState(0);
	const [msgNotifNum, setMsgNotifNum] = useState(0);
	const [request, setRequest] = useState(0);
	const incrMsgNotifNum = (payload) => {
		setMsgNotifNum(msgNotifNum + 1);
	};
	const incrRestMadeOrderNotifNum = (payload) => {
		setRestMadeOrderNotifNum(restMadeOrderNotifNum + 1);
	};
	const incrCarrierAcceptedNotifNum = (payload) => {
		setCarrierAcceptedNotifNum(carrierAcceptedNotifNum + 1);
	};
	const incrDeliveryStartedNotifNum = (payload) => {
		setDeliveryStartedNotifNum(deliveryStartedNotifNum + 1);
	};
	const incrRequestNotifNum = (payload) => {
		console.log('INCREMENTING REQ NUM!!!');
		setRequest(request + 1);
	};
	console.log('RESET LISTENERS');
	if (socket) {
		if (['Customer', 'Carrier'].includes(role)) {
			socket.off('new-message', incrMsgNotifNum);
			socket.on('new-message', incrMsgNotifNum);
		}
		if (role == 'Customer') {
			console.log('RESETING CUSTOMER LISTENERS');
			socket.off('order-ready', incrDeliveryStartedNotifNum);
			socket.on('order-ready', incrDeliveryStartedNotifNum);
		}
		if (role == 'Carrier') {
			console.log('RESETING CARRIER LISTENERS');
			socket.off('new-delivery', incrRequestNotifNum);
			socket.on('new-delivery', incrRequestNotifNum);
			socket.off('order-ready', incrRestMadeOrderNotifNum);
			socket.on('order-ready', incrRestMadeOrderNotifNum);
		} else if (role == 'RestaurantInstance') {
			console.log('RESETING INSTANCE LISTENERS');
			socket.off('new-order', incrRequestNotifNum);
			socket.on('new-order', incrRequestNotifNum);
			socket.off('carrier-accepter-order', incrCarrierAcceptedNotifNum);
			socket.on('carrier-accepter-order', incrCarrierAcceptedNotifNum);
		}
	}
	useEffect(() => {
		let timer;
		if (role == 'Customer') {
			getCustomerCurrentDeliveries()
				.then(({ data }) => {
					setDeliveryStartedNotifNum(
						data ? (data instanceof Array ? data.length : 0) : 0
					);
				})
				.catch((err) => console.log(err));
		} else if (role == 'Carrier') {
			timer = setInterval(() => {
				console.log('pos changed?');
				if (navigator.geolocation)
					navigator.geolocation.getCurrentPosition(
						({ coords: { latitude, longitude } }) => {
							console.log(`lat is ${latitude} \nlong is ${longitude}`);
							socket.emit('carrierPositionChanged', latitude, longitude);
						}
					);
			}, 2000);

			getCarrierCurrentDeliveries()
				.then(({ data }) => {
					setRestMadeOrderNotifNum(
						data ? (data instanceof Array ? data.length : 0) : 0
					);
				})
				.catch((err) => console.log(err));
			getCarrierPendingDeliveries()
				.then(({ data }) => {
					setRequest(data ? (data instanceof Array ? data.length : 0) : 0);
				})
				.catch((err) => console.log(err));
		} else if (role == 'RestaurantInstance') {
			getInstancePendingOrders()
				.then(({ data }) => {
					setRequest(data ? (data instanceof Array ? data.length : 0) : 0);
				})
				.catch((err) => console.log(err));
			getInstanceCurrentOrders()
				.then(({ data }) => {
					setCarrierAcceptedNotifNum(
						data ? (data instanceof Array ? data.length : 0) : 0
					);
				})
				.catch((err) => console.log(err));
		}
		return () => {
			console.log(`UNMOUNTED NAVBAR!!!!!!\n\n\n`);
			console.log(`TIMER IS ${timer}`);
			if (timer) {
				clearInterval(timer);
			}
		};
	}, [socket]);

	const logOutHandler = () => {
		if (socket) socket.emit('logout');
		console.log('CLEARING STORAGE');
		localStorage.clear();
	};

	var homeStr;
	if (role == 'Customer') homeStr = '/Home/Restaurants';
	else if (role == 'Restaurant') homeStr = '/Home/Menu';
	else if (role == 'RestaurantInstance') homeStr = '/Home/CurrentOrders';
	else homeStr = '/Home/CurrentDeliveries';
	let first_el;
	if (role == 'Carrier') {
		first_el = (
			<div>
				<Link to="/Home/CurrentDeliveries">
					<a
						class="item"
						onClick={() => {
							setRestMadeOrderNotifNum(0);
						}}
					>
						<i class="large shipping fast icon"></i>
					</a>
				</Link>
				<a class="mini ui red circular label">{restMadeOrderNotifNum}</a>
			</div>
		);
	} else if (role == 'RestaurantInstance') {
		first_el = (
			<div>
				<Link to="/Home/CurrentOrders">
					<a
						class="item"
						onClick={() => {
							setCarrierAcceptedNotifNum(0);
						}}
					>
						<i class="large stopwatch icon"></i>
					</a>
				</Link>
				<a class="mini ui red circular label">{carrierAcceptedNotifNum}</a>
			</div>
		);
	} else if (role == 'Customer') {
		first_el = (
			<div>
				<Link to="/Home/Restaurants">
					<a class="item">
						<i class="large utensils icon"></i>
					</a>
				</Link>
			</div>
		);
	} else if (role == 'Restaurant') {
		first_el = (
			<div>
				<Link to="/Home/Menu">
					<a class="item">
						<i class="large utensils icon"></i>
					</a>
				</Link>
			</div>
		);
	}
	return (
		<div className="headerLine">
			<div className="logOutBtn">
				<Link to="/">
					<button class="ui red button" onClick={logOutHandler}>
						Log out
					</button>
				</Link>
			</div>

			<div className="navBarElArray">
				<div>
					{first_el}
					{/* <Link to={homeStr}>
						<a class="item">
							<i class="large home icon"></i>
						</a>
					</Link> */}
				</div>
				{role == 'Customer' ? (
					<div>
						<Link to="/Home/Basket">
							<a class="item">
								<i class="large shopping cart icon"></i>
							</a>
						</Link>
					</div>
				) : (
					''
				)}
				{role == 'Restaurant' ? (
					<div>
						<Link to="/Home/Instances">
							<a class="item">
								<i class="large building icon"></i>
							</a>
						</Link>
					</div>
				) : (
					''
				)}
				{role == 'Customer' || role == 'Carrier' ? (
					<div>
						<Link to="/Home/Chat">
							<a
								class="item"
								onClick={() => {
									setMsgNotifNum(0);
								}}
							>
								<i class="large rocketchat icon"></i>
							</a>
						</Link>
						<a class="mini ui red circular label">{msgNotifNum}</a>
					</div>
				) : (
					''
				)}
				{
					<div>
						<Link to="/Home/Orders">
							<a class="item">
								<i class="large clipboard check icon"></i>
							</a>
						</Link>
					</div>
				}
				{role == 'Customer' ? (
					<div>
						<Link to="/Home/Deliveries">
							<a
								class="item"
								onClick={() => {
									setDeliveryStartedNotifNum(0);
								}}
							>
								<i class="large shipping fast icon"></i>
							</a>
						</Link>
						<a class="mini ui red circular label">{deliveryStartedNotifNum}</a>
					</div>
				) : (
					''
				)}
				{role == 'Carrier' || role == 'RestaurantInstance' ? (
					<div>
						<Link to="/Home/Requests">
							<a
								class="item"
								onClick={() => {
									setRequest(0);
								}}
							>
								<i class="large clipboard icon"></i>
							</a>
						</Link>
						<a class="mini ui red circular label">{request}</a>
					</div>
				) : (
					''
				)}
				<div>
					<Link to="/Home/Settings">
						<a class="item">
							<i class="large cog icon"></i>
						</a>
					</Link>
				</div>
			</div>
		</div>
	);
}

export default NavBar;
// useEffect(() => {
// 	console.log('rerenderovanje!!!');
// 	if (!socket) return;
// 	if (['Customer', 'Carrier'].includes(role))
// 		socket.on('new-message', (payload) => {
// 			setMsgNotifNum(msgNotifNum + 1);
// 		});
// 	if (role == 'Customer') {
// 		socket.on('order-ready', (payload) => {
// 			setDeliveryStartedNotifNum(deliveryStartedNotifNum + 1);
// 		});
// 	}
// 	if (role == 'Carrier') {
// 		socket.on('new-delivery', (payload) => {
// 			setRequest(request + 1);
// 		});
// 		socket.on('order-ready', (payload) => {
// 			setRestMadeOrderNotifNum(restMadeOrderNotifNum + 1);
// 		});
// 	} else if (role == 'RestaurantInstance') {
// 		socket.on('new-order', (payload) => {
// 			setRequest(request + 1);
// 		});
// 		socket.on('carrier-accepter-order', (payload) => {
// 			setCarrierAcceptedNotifNum(carrierAcceptedNotifNum + 1);
// 		});
// 	}

// 	// socket.on();
// }, [
// 	msgNotifNum,
// 	deliveryStartedNotifNum,
// 	restMadeOrderNotifNum,
// 	carrierAcceptedNotifNum,
// 	request,
// ]);
