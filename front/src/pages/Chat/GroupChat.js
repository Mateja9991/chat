import react, { useEffect, useRef, useState } from 'react';
import '../../styles/Chat.css';
import Message from './Message';
import {
	getGroupMessageHistory,
	getGroupSession,
	searchMessageHistory,
} from '../../API';
import { useSocket } from '../../context/socketProvider';
import { AvatarGenerator } from 'random-avatar-generator';
import { url } from '../../constants/constants';
import { getBase64, convertDataURIToBinary } from './utils';

import ChatSidebar from '../../components/Sidebar';
const generator = new AvatarGenerator();
function GroupChat({ selected: group = { id: 1, name: 'Group' } }) {
	const currentUserId = localStorage.getItem('id');
	const fileInputRef = useRef();
	const picInputRef = useRef();
	const inputRef = useRef();
	const inputRefSearch = useRef();
	const [session, setSession] = useState();
	const [serialNum, setSerialNum] = useState(1);
	const [totalNum, setTotalNum] = useState(null);
	const [searchFlag, setSearchFlag] = useState(false);
	const [searchTerm, setSearchTerm] = useState();
	const [usersTypingMessage, setUsersTypingMessage] = useState([]);
	const [selectedPicture, setSelectedPicture] = useState();
	const [selectedFile, setSelectedFile] = useState();
	const [recordedAudio, setRecordedAudio] = useState();
	const [settingsOpened, setSettingsOpened] = useState(false);
	const [searchOpened, setSearchOpened] = useState(false);
	const [messages, setMessages] = useState([]);
	const [skip, setSkip] = useState(0);
	const [plus, setPlus] = useState(true);
	const [restartChat, setRestartChat] = useState(false);

	let globalMediaRecorder;
	const limit = 10;
	let newMessageListener;
	let typingIntervalId;

	const socket = useSocket();
	const bottomRef = useRef();
	const scrollToBottom = () => {
		console.log('scrolling into view');
		bottomRef.current.scrollIntoView({ behavior: 'smooth' });
	};
	useEffect(() => {
		scrollToBottom();
	}, [messages]);
	useEffect(() => {
		if (socket) {
			socket.on(
				'user-unsent-message',
				({ sessionId, messageId }) =>
					session._id == sessionId && deleteMessageCallback(messageId)
			);
		}
		return () => {
			socket.off('user-unsent-message');
		};
	}, [session, messages]);
	useEffect(() => {
		if (socket) {
			if (newMessageListener) socket.off('new-message', newMessageListener);
			newMessageListener = (payload) => {
				if (!group) return;
				const {
					user: { username: senderUsername, id: senderId },
					sessionId,
					sessionKey,
					message: { id, content, contentType, fileName, text, seenBy, from },
				} = payload;
				if (sessionKey != group.id) return;
				const msgElement = {
					id,
					text,
					content,
					contentType,
					fileName,
					seenBy,
					dirFlag: localStorage.getItem('id') == senderId,
					createdAt: Date.now(),
					userAvatar: from.avatar.small,
					from: senderId,
				};
				socket.emit('userSeenMessage', id);
				setMessages([...messages, msgElement]);
			};
			socket.on('new-message', newMessageListener);
			socket.on(
				'user-seen-message',
				async ({ sessionId, userId, username, messageId }) => {
					if (session && session._id == sessionId) {
						setMessages(
							messages.map((msg) => {
								if (msg.id == messageId) {
									msg.seenBy.push({
										username,
										id: userId,
									});
								}
								return msg;
							})
						);
					}
				}
			);
		}
		return () => {
			if (socket) {
				socket.off('user-seen-message');
				if (newMessageListener) {
					socket.off('new-message', newMessageListener);
				}
			}
		};
	}, [messages, group]);
	useEffect(() => {
		getGroupSession(group.id)
			.then(({ data }) => {
				setSession(data);
			})
			.catch((err) => console.log(err));
		return () => {
			setMessages([]);
		};
	}, []);
	// useEffect(() => {
	// 	console.log('settn skip');
	// 	setSkip(0);
	// }, [user]);
	useEffect(() => {
		if (socket) {
			socket.on('user-started-typing', ({ userId, username, sessionId }) => {
				if (sessionId == group.id) {
					if (
						usersTypingMessage.filter((oldUsername) => oldUsername === username)
							.length
					)
						return;

					setUsersTypingMessage([...usersTypingMessage, username]);
				}
			});
			socket.on('user-stopped-typing', ({ userId, username, sessionId }) => {
				if (sessionId == group.id) {
					setUsersTypingMessage(
						usersTypingMessage.filter((oldUsername) => oldUsername !== username)
					);
				}
			});
		}
		return () => {
			if (socket) {
				socket.off('user-stopped-typing');
				socket.off('user-started-typing');
			}
		};
	}, [group, usersTypingMessage]);
	const fetchMessages = (skip) => {
		if (group) {
			getGroupMessageHistory(group.id, { limit, skip })
				.then(({ data }) => {
					console.log(data);
					if (messages && skip) {
						setMessages([
							...data.map((msg) => ({
								id: msg._id,
								text: msg.text,
								content: msg.content,
								contentType: msg.contentType,
								fileName: msg.fileName,
								seenBy: msg.seenBy,
								dirFlag: msg.from._id == currentUserId,
								createdAt: msg.createdAt,
								userAvatar: msg.from.avatar.small,
								from: msg.from,
							})),
							...messages,
						]);
					} else {
						setMessages(
							data.map((msg) => ({
								id: msg._id,
								text: msg.text,
								content: msg.content,
								fileName: msg.fileName,
								contentType: msg.contentType,
								seenBy: msg.seenBy,
								dirFlag: msg.from._id == currentUserId,
								userAvatar: msg.from.avatar.small,
								createdAt: msg.createdAt,
								from: msg.from,
							}))
						);
					}
				})
				.catch((err) => {
					console.log(err);
				});
		}
	};
	useEffect(() => {
		fetchMessages(skip);
		return () => {
			if (socket && newMessageListener) {
				socket.off('new-message', newMessageListener);
			}
		};
	}, [group, skip]);
	useEffect(() => {
		// if (!messages.length) fetchMessages(skip);
		return () => {
			setMessages([]);
			setSkip(0);
		};
	}, [restartChat]);
	useEffect(() => {
		if (searchFlag) {
			setSerialNum(1);
		} else {
		}
		return () => {
			setSearchTerm(null);
			setTotalNum(null);
			setSerialNum(null);
			setRestartChat(!restartChat);
		};
	}, [searchFlag]);
	useEffect(() => {
		if (recordedAudio) sendMessage();
	}, [recordedAudio]);
	const submitSearch = (searchTerm) => {
		if (!session) return;
		console.log(searchTerm);
		console.log(session);
		searchMessageHistory(session._id, searchTerm, serialNum - 1, !totalNum)
			.then(({ data: { messages: dataMessages, totalNum } }) => {
				// if (messages.length) setMessages([...data, ...messages]);
				// else
				setTotalNum(totalNum);
				setMessages([
					...dataMessages.map((msg) => ({
						id: msg._id,
						text: msg.text,
						content: msg.content,
						fileName: msg.fileName,
						seenBy: msg.seenBy,
						contentType: msg.contentType,
						dirFlag: msg.from == localStorage.getItem('id'),
						createdAt: msg.createdAt,
						from: msg.from,
					})),
				]);
			})
			.catch((err) => console.log(err));
	};
	useEffect(() => {
		if (!session || !searchTerm) return;

		submitSearch(searchTerm);
	}, [searchTerm, serialNum]);
	const sendMessage = async () => {
		if (group != null) {
			let text = '';
			if (inputRef.current.value != null && inputRef.current.value != '') {
				text = inputRef.current.value;
			}
			let additionalContent = {};
			if (recordedAudio) {
				additionalContent = {
					contentType: 'audio',
					content: recordedAudio,
				};
			} else if (selectedFile) {
				additionalContent = {
					contentType: 'text',
					fileName: selectedFile.name,
					content: await selectedFile.text().catch((err) => console.log(err)),
				};
			} else if (selectedPicture) {
				additionalContent = {
					contentType: 'image',
					content: await getBase64(selectedPicture).catch((err) =>
						console.log(err)
					),
				};
			}

			if (socket) {
				socket.emit('newMessageToGroup', group.id, {
					text,
					content: additionalContent.content,
					fileName: additionalContent.fileName,
					contentType: additionalContent.contentType,
				});
			}
			// const msg = {
			// 	id: messages.length + 1,
			// 	text,
			// 	contentType: additionalContent.contentType,
			// 	fileName: additionalContent.fileName,
			// 	seenBy: [localStorage.getItem('username')],
			// 	content: additionalContent.content,
			// 	dirFlag: true,
			// };
			setRecordedAudio(null);
			setSelectedFile(null);
			setSelectedPicture(null);
			// if (messages != null) {
			// 	setMessages([...messages, msg]);
			// } else {
			// 	setMessages([msg]);
			// }
			inputRef.current.value = '';
		} else alert('Morati izabrati korisnika kome zelite da posaljete poruku.');
	};
	var messageList;
	const getTimeGap = (dateOne, dateTwo) =>
		new Date(dateTwo) - new Date(dateOne);
	const deleteMessageCallback = (id) => {
		setMessages(messages.filter(({ id: msgId }) => msgId !== id));
	};
	if (messages != null) {
		messageList = messages.map((msg, ind) => {
			const {
				id,
				text,
				dirFlag,
				content,
				contentType,
				fileName,
				createdAt,
				seenBy,
				userAvatar,
			} = msg;
			return (
				<Message
					key={id}
					id={id}
					dirFlag={dirFlag}
					text={text}
					createdAt={createdAt}
					content={content}
					fileName={fileName}
					isTimeGap={
						ind + 1 < messages.length &&
						getTimeGap(createdAt, messages[ind + 1].createdAt) > 3600000
					}
					contentType={contentType}
					deleteMe={deleteMessageCallback}
					seenBy={seenBy}
					// position={
					// 	ind - 1 >= 0 && messages[ind - 1].from._id != msg.from._id
					// 		? 'first'
					// 		: ind < messages.length - 1 &&
					// 		  messages[ind + 1].from._id != msg.from._id
					// 		? 'last'
					// 		: ''
					// }
					userAvatar={
						ind - 1 >= 0 && messages[ind - 1].from._id != msg.from._id
							? userAvatar
							: null
					}
				/>
			);
		});
	} else {
		messageList = '';
	}

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			sendMessage();
		}
	};
	const handleSearch = (e) => {
		if (e.key === 'Enter') {
			setSearchTerm(inputRefSearch.current.value);
		}
	};
	const settingsButton = (
		<div className="settings-button-div">
			<div
				onClick={() => {
					setSettingsOpened(!settingsOpened);
				}}
				className="big plus icon"
			></div>
		</div>
	);
	const userLabel = (
		<div className="user-label-wrapper">
			<div className="avatar-wrapper label">
				<img
					className="avatar"
					src={
						group
							? group.avatar
								? `data:image/png;base64, ${group.avatar.picture}`
								: `${url}/img/nopic.jpg`
							: `${url}/img/nopic.jpg`
					}
				/>
			</div>

			<div className="username-wrapper label">{group.name}</div>
			<div className="settings-icon-button">
				<i
					class="large cog icon"
					style={{ cursor: 'pointer' }}
					onClick={() => {
						setSettingsOpened(!settingsOpened);
					}}
				></i>
			</div>
		</div>
	);
	return (
		<div className="message-settings-container">
			<div className="messageBox">
				<div className="chat-top-part">
					<div className="char-user-label">
						{group != null ? userLabel : ''}
					</div>
					<div className="button-wrapper ">
						{plus && group ? (
							<div className="plus-icon-button">
								<i
									class="big plus icon invert"
									style={{ cursor: 'pointer' }}
									onClick={() => {
										setSkip(skip + limit);
									}}
								></i>
							</div>
						) : (
							''
						)}
					</div>

					{searchFlag ? (
						<div className="srchBar">
							<div className="search-contact">
								<div class="ui input" style={{ width: '95%' }}>
									<input
										type="text"
										placeholder="Search messages"
										ref={inputRefSearch}
										onKeyDown={handleSearch}
									/>
								</div>
							</div>
							{totalNum ? (
								<div className="arrNumWrapper">
									<label className="lblNumbers">
										{serialNum}/{totalNum}
									</label>
									<div className="arrows-wrapper">
										<i
											className="big angle up icon arrow-icon"
											style={{ cursor: 'pointer' }}
											onClick={() => {
												setSerialNum(
													serialNum + 1 <= totalNum ? serialNum + 1 : 1
												);
											}}
										></i>
										<i
											className="big angle down icon arrow-icon"
											style={{ cursor: 'pointer' }}
											onClick={() => {
												setSerialNum(
													serialNum - 1 > 0 ? serialNum - 1 : totalNum
												);
											}}
										></i>
									</div>
								</div>
							) : (
								''
							)}
							<button
								class="ui button search-button"
								style={{ height: '40%', 'margin-right': '1%' }}
								onClick={() => {
									setSearchFlag(false);
								}}
							>
								Close
							</button>
						</div>
					) : (
						''
					)}
				</div>
				<div className="messages">
					{messageList}
					<div ref={bottomRef}> </div>
				</div>
				{usersTypingMessage.length ? (
					<div className="users-typing-container">
						<label className="users-typing-message">
							{' '}
							{usersTypingMessage.reduce(
								(acc, user) => `${acc}${acc ? ', ' : ''}${user}`,
								''
							)}{' '}
							{usersTypingMessage.length > 1 ? 'are' : 'is'} typing...
						</label>
					</div>
				) : (
					''
				)}

				<div className="textBox">
					<div class=" ui input">
						<div className="chat-icon-container">
							<i
								className="big file icon"
								onClick={() => {
									fileInputRef.current.click();
								}}
							/>

							{/* */}
							<input
								ref={fileInputRef}
								type="file"
								style={{ display: 'none' }}
								accept="text/plain"
								onChange={(event) => {
									alert(event.target.files[0]);
									if (selectedPicture) setSelectedPicture(null);
									setSelectedFile(event.target.files[0]);
								}}
							/>
							<input
								ref={picInputRef}
								type="file"
								style={{ display: 'none' }}
								accept="image/*"
								onChange={(event) => {
									alert(event.target.files[0]);
									if (selectedFile) setSelectedFile(null);
									setSelectedPicture(event.target.files[0]);
								}}
							/>
							<i
								className="big file image icon"
								onClick={() => {
									picInputRef.current.click();
								}}
							/>
							<i
								className="big microphone icon"
								onMouseUp={() => {
									if (globalMediaRecorder) {
										globalMediaRecorder.stop();
									}
									globalMediaRecorder = null;
								}}
								onMouseDown={() => {
									navigator.mediaDevices
										.getUserMedia({ audio: true })
										.then((stream) => {
											const mediaRecorder = new MediaRecorder(stream);
											globalMediaRecorder = mediaRecorder;
											mediaRecorder.start();

											const audioChunks = [];
											mediaRecorder.addEventListener(
												'dataavailable',
												(event) => {
													audioChunks.push(event.data);
												}
											);

											mediaRecorder.addEventListener('stop', async () => {
												const audioBlob = new Blob(audioChunks);
												const base64Audio = await getBase64(audioBlob);
												setRecordedAudio(base64Audio);
												var binary = convertDataURIToBinary(base64Audio);
												var blobText = new Blob([binary], {
													type: 'audio/ogg',
												});

												const audioUrl = URL.createObjectURL(blobText);

												const audio = new Audio(audioUrl);
												audio.play();
											});
										});
								}}
							/>
						</div>

						<input
							type="text"
							placeholder="Enter message..."
							ref={inputRef}
							onKeyDown={handleKeyDown}
							onChange={() => {
								if (typingIntervalId) clearInterval(typingIntervalId);
								socket.emit(
									'userStartedTyping',
									localStorage.getItem('id'),
									group.id,
									true
								);
								typingIntervalId = setTimeout(() => {
									socket.emit(
										'userStoppedTyping',
										localStorage.getItem('id'),
										group.id,
										true
									);
								}, 2000);
							}}
						/>
					</div>
				</div>
			</div>
			{settingsOpened ? (
				<div className="chat-settings-wrapper">
					<ChatSidebar
						session={session}
						onClose={() => setSettingsOpened(false)}
						onSearch={() => setSearchOpened(true)}
						setSearchFlag={setSearchFlag}
						visibility={settingsOpened}
					/>
				</div>
			) : (
				''
			)}
		</div>
	);
}

export default GroupChat;
