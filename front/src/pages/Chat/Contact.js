import react, { useState, useEffect } from 'react';
import { AvatarGenerator } from 'random-avatar-generator';
import { useSocket } from '../../context/socketProvider';
import { url } from '../../constants/constants';

const generator = new AvatarGenerator();

function Contact({
	id,
	name,
	active,
	numOfUnreadMessages: unreadMessages,
	session,
	messagePart,
	avatar,
	imgSrc,
	setSelected,
}) {
	const socket = useSocket();

	const [status, setStatus] = useState(active); // neka mu posalje roditelj

	useEffect(() => {
		if (socket) {
			socket.on('user-status-changed', ({ userId, active }) => {
				console.log('compare:');
				console.log(session.id);
				console.log(userId);
				if (session.id == userId) setStatus(active);
			});
		}
		return () => {
			if (socket) {
				socket.off('user-status-changed');
			}
		};
	}, [session]);
	const contactClicked = () => {
		setSelected(session);
	};

	return (
		<div className="contact" onClick={contactClicked}>
			<div className="contact-image-container">
				<img
					className="avatar"
					src={
						avatar
							? `data:image/png;base64, ${avatar.picture}`
							: `${url}/img/nopic.jpg`
					}
				/>
			</div>
			<label className="username-label">{name}</label>
			<span className="last-message-part">{messagePart}</span>
			{unreadMessages ? (
				<div className="num-of-msg-wrapper">
					<span className="numOfMessages">{unreadMessages}</span>
				</div>
			) : (
				''
			)}
			{status == true ? <i className="green circle icon"></i> : ''}
		</div>
	);
}

export default Contact;
