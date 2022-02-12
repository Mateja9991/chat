import React, { useEffect, useRef, useState } from 'react';
import '../../styles/Chat.css';
import { convertDataURIToBinary } from './utils';
import TimeAgo from 'timeago-react';
import { deleteMessage } from '../../API';
import { useSocket } from '../../context/socketProvider';
const Message = ({
	id,
	createdAt,
	dirFlag,
	text,
	content,
	contentType,
	fileName,
	isTimeGap,
	deleteMe,
	seenBy,
	userAvatar,
	position = '',
}) => {
	const dayInMs = 86400000;
	const socket = useSocket();
	const [imagePopup, setImagePopup] = useState(null);
	const fileRef = useRef();
	const audioRef = useRef();
	const timeAgoRef = useRef();
	const seenLabelRef = useRef();
	const playedAudioRef = useRef();
	const remainingAudioRef = useRef();
	const [audioPlayer, setAudioPlayer] = useState(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [duration, setDuration] = useState(null);
	const [playedInterval, setPlayedInterval] = useState();
	const [clickedFlag, setClickedFlag] = useState(false);
	const [contextMenu, setContextMenu] = useState(false);
	const [menuPosition, setMenuPosition] = useState();
	const contextRef = useRef();
	const audioIcon = isPlaying ? (
		<i className="large pause icon play-audio" />
	) : (
		<i className="large play icon play-audio" />
	);

	const moreOptions = (
		<div
			class="more-options"
			style={{
				top: menuPosition ? menuPosition.y : '',
				left: menuPosition ? menuPosition.x : '',
			}}
		>
			<a
				class="option-item"
				onClick={() => {
					deleteMessage(id)
						.then(({ data }) => {
							deleteMe(id);
						})
						.catch((err) => console.log(err));
				}}
			>
				Delete Message
			</a>
			<a
				class="option-item"
				onClick={() => {
					if (socket) {
						socket.emit('userUnsentMessage', id);
					}
				}}
			>
				Unsend Message
			</a>
		</div>
	);
	const findWidth = () => {
		const w = text.length * 17;
		if (w > 180) {
			return 180;
		} else {
			return w;
		}
	};
	// useEffect(() => {
	// 	if (!contextRef.current) return;
	// 	if (contextMenu) contextRef.current.style.display = 'block';
	// 	else contextRef.current.style.display = 'none';
	// 	contextRef.current.style.color =
	// 		contextRef.current.style.color === 'red' ? 'blue' : 'red';
	// 	console.log(contextRef.current.style.display);
	// }, [contextMenu]);
	useEffect(() => {
		if (clickedFlag && timeAgoRef && timeAgoRef.current) {
			timeAgoRef.current.style.transform = 'scaleY(1)';
			seenLabelRef.current.style.transform = 'scaleY(1)';
		}
	}, [clickedFlag]);

	const time = new Date(createdAt).toString().substring(0, 24);

	const w = findWidth() + 'px';
	const date = new Date(createdAt);
	let contentClass;
	let additionalContent = '';
	useEffect(() => {
		if (contentType == 'audio') {
			var binary = convertDataURIToBinary(content);
			var blobText = new Blob([binary], {
				type: 'audio/ogg',
			});
			const audioUrl = URL.createObjectURL(blobText);
			const _audioPlayer = new Audio(audioUrl);

			_audioPlayer.addEventListener(
				'loadedmetadata',
				async function () {
					while (_audioPlayer.duration === Infinity) {
						await new Promise((r) => setTimeout(r, 100));
						_audioPlayer.currentTime = 10000000 * Math.random();
					}

					setDuration(_audioPlayer.duration);
				},
				false
			);

			setAudioPlayer(_audioPlayer);
		}
		return () => {
			if (playedInterval) clearInterval(playedInterval);
		};
	}, [contentType]);
	useEffect(() => {
		if (!isPlaying && playedInterval) {
			clearInterval(playedInterval);
		}
	}, [isPlaying]);
	// useEffect(() => {
	// 	if (!audioPlayer) return;

	// }, [audioPlayer]);
	useEffect(() => {
		return () => clearInterval(playedInterval);
	}, [playedInterval]);
	useEffect(() => {
		return () => {
			if (audioPlayer) audioPlayer.pause();
		};
	}, [audioPlayer]);
	useEffect(() => {
		if (!duration) return;
		audioRef.current.style.width = `${6 + (duration / 30) * 50}vh`;
	}, [duration]);
	switch (contentType) {
		case 'image':
			contentClass = 'content-image';
			additionalContent = (
				<div
					className="msg-content-wrapper"
					onContextMenu={(e) => {
						e.preventDefault();
						e.stopPropagation();
						setContextMenu(!contextMenu);
						setMenuPosition({ x: e.clientX, y: e.clientY });
					}}
				>
					<div className="msg-image-wrapper">
						<img
							className="msg-image"
							onClick={() => {
								setImagePopup(true);
							}}
							src={`data:image/png;base64, ${content}`}
						/>
					</div>
				</div>
			);
			break;
		case 'text':
			contentClass = 'content-text';
			additionalContent = (
				<div
					className="msg-content-wrapper"
					onContextMenu={(e) => {
						e.preventDefault();
						e.stopPropagation();
						setContextMenu(!contextMenu);
						setMenuPosition({ x: e.clientX, y: e.clientY });
					}}
				>
					<div
						className="msg-file-wrapper"
						onClick={() => {
							fileRef.current.click();
						}}
					>
						<div className="msg-file">
							<i className="large file icon file-icon" />
							<a
								ref={fileRef}
								href={`data:text/plain;charset=utf-8, ${content}`}
								download={`${fileName ? fileName : 'unknown.txt'}`}
							/>
						</div>
						<div className="msg-file-name-container">
							{' '}
							<label className="msg-file-name">
								{' '}
								{`${fileName ? fileName : 'unknown.txt'}`}
							</label>
						</div>
					</div>
				</div>
			);
			break;
		case 'audio':
			contentClass = 'content-audio';
			additionalContent = (
				<div
					className="msg-content-wrapper"
					onContextMenu={(e) => {
						e.preventDefault();
						e.stopPropagation();
						setContextMenu(!contextMenu);
						setMenuPosition({ x: e.clientX, y: e.clientY });
					}}
					ref={audioRef}
				>
					<div
						className="msg-audio-wrapper"
						onClick={async () => {
							if (isPlaying) {
								clearInterval(playedInterval);
								if (audioPlayer) audioPlayer.pause();
								setIsPlaying(!isPlaying);
							} else {
								setIsPlaying(!isPlaying);
								if (
									Number(playedAudioRef.current.style.width.split('%')[0]) >=
									100
								) {
									playedAudioRef.current.style.width = '0%';
								} else {
								}
								if (audioPlayer) {
									if (playedInterval) clearInterval(playedInterval);

									audioPlayer.play();

									// await audioPlayer.pause();
									// audioPlayer.currentTime = 0;
									// // await audioPlayer.pause();
									// await audioPlayer.play();
									const changeWidth = () => {
										if (
											playedAudioRef.current.style.width &&
											playedAudioRef.current.style.width.split('%').length &&
											playedAudioRef.current.style.width.split('%')[0] != '0'
										) {
											playedAudioRef.current.style.width =
												Number(
													playedAudioRef.current.style.width.split('%')[0]
												) +
												(1 / duration) * 100 +
												'%';
										} else {
											playedAudioRef.current.style.width =
												(1 / duration) * 100 + '%';
										}
										console.log(
											Number(playedAudioRef.current.style.width.split('%')[0])
										);
										if (
											Number(
												playedAudioRef.current.style.width.split('%')[0]
											) >= 100
										) {
											setIsPlaying(false);
											clearInterval(playedInterval);
											setPlayedInterval(null);
										}
									};
									changeWidth();
									setPlayedInterval(
										setInterval(() => {
											changeWidth();
										}, 1000)
									);
								}
							}
						}}
					>
						<div className="played-audio" ref={playedAudioRef}></div>
						<div className="remaining-audio" ref={remainingAudioRef}></div>
						{audioIcon}
					</div>
				</div>
			);
		case 'none':
	}
	const showImage = () => {
		return (
			<div className="popup-container">
				<div
					className="popupWrapper"
					onClick={() => {
						setImagePopup(false);
					}}
				>
					<img
						className="popup-image"
						src={`data:image/png;base64, ${content}`}
					/>
				</div>
			</div>
		);
	};
	const seenLabel = (
		<div className="seen-label-wrapper" ref={seenLabelRef}>
			<label className="seen-label">
				{' '}
				{`Seen by ${seenBy.reduce(
					(acc, { username }) => `${acc}${acc ? ', ' : ''}${username}`,
					''
				)}`}
			</label>
		</div>
	);
	if (dirFlag === true) {
		return (
			<>
				{contextMenu ? moreOptions : <></>}
				{imagePopup ? showImage() : ''}
				{userAvatar ? (
					<div className="message-user-avatar avatar-wrapper incoming">
						{' '}
						<img
							className="avatar"
							src={`data:image/png;base64, ${userAvatar}`}
						></img>
					</div>
				) : (
					''
				)}
				<div
					className="messageWrap"
					onClick={() => setClickedFlag(!clickedFlag)}
				>
					{isTimeGap ? <div className="timeWrapper">{time}</div> : ''}
					{clickedFlag ? (
						<div className="timeago-wrapper" ref={timeAgoRef}>
							{' '}
							<TimeAgo datetime={time} locale="sr-RS" />{' '}
						</div>
					) : (
						''
					)}
					{text ? (
						<div
							className={'messageChat message incoming ' + position}
							style={{}}
							onContextMenu={(e) => {
								e.preventDefault();
								e.stopPropagation();
								setMenuPosition({ x: e.clientX, y: e.clientY });

								setContextMenu(!contextMenu);
							}}
						>
							<div className="msg-text">{text}</div>
						</div>
					) : (
						''
					)}
					{additionalContent ? additionalContent : ''}
					{clickedFlag ? seenLabel : ''}
				</div>
			</>
		);
	} else {
		return (
			<>
				{contextMenu ? moreOptions : <></>}
				{imagePopup ? showImage() : ''}
				{userAvatar ? (
					<div className="message-user-avatar avatar-wrapper outgoing">
						{' '}
						<img
							className="avatar"
							src={`data:image/png;base64, ${userAvatar}`}
						></img>
					</div>
				) : (
					''
				)}
				<div
					className="messageWrap2"
					onClick={() => setClickedFlag(!clickedFlag)}
				>
					{isTimeGap ? <div className="timeWrapper">{time}</div> : ''}
					{clickedFlag ? (
						<div className="timeago-wrapper" ref={timeAgoRef}>
							<TimeAgo datetime={time} locale="sr-RS" />
						</div>
					) : (
						''
					)}
					{text ? (
						<>
							<div
								className={'messageChat message outgoing ' + position}
								style={{}}
								onContextMenu={(e) => {
									e.preventDefault();
									e.stopPropagation();
									setMenuPosition({ x: e.clientX, y: e.clientY });

									setContextMenu(!contextMenu);
								}}
							>
								<div className="msg-text">{text}</div>
							</div>
						</>
					) : (
						''
					)}
					{additionalContent ? additionalContent : ''}
					{clickedFlag ? seenLabel : ''}
				</div>
			</>
		);
	}
};

export default Message;
