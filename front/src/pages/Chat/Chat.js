import react, { useState, useEffect } from 'react';
import MessageBox from './MessageBox';
import GroupChat from './GroupChat';
import Contacts from './Contacts';
import { useSocket } from '../../context/socketProvider';
import '../../styles/Chat.css';
import ChatSidebar from '../../components/Sidebar';
function Chat({ user, role }) {
	const socket = useSocket();
	const [selected, setSelected] = useState(null);
	const [currentMessageBox, setCurrentMessageBox] = useState(
		<div className="message-box-placeholder"></div>
	);
	const [messagesFlag, setMessagesFlag] = useState(true);
	// useEffect(() => {}, []);
	useEffect(() => {
		if (selected) {
			if (selected.isGroup) {
				setCurrentMessageBox(<GroupChat selected={selected} se />);
			}
			if (!selected.isGroup) {
				setCurrentMessageBox(<MessageBox selected={selected} se />);
			}
		}
		setMessagesFlag(false);
		setTimeout(() => {
			setMessagesFlag(true);
		}, 10);
	}, [selected]);
	return (
		<div className="chat-wrapper">
			<Contacts
				setSelected={setSelected}
				selected={selected}
				user={user}
				role={role}
			/>
			{messagesFlag ? (
				currentMessageBox
			) : (
				<div className="message-box-placeholder"></div>
			)}
		</div>
	);
}

export default Chat;
