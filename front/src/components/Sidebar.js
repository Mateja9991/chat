import react from 'react';
import React from 'react';
import { Header, Icon, Image, Menu, Segment, Sidebar } from 'semantic-ui-react';
import '../styles/Chat.css';
import { useState, useEffect } from 'react';
import { getContentFromSession } from '../API';
import nisImg from './nis.jpg';
import treeImg from './tree.jpg';

const ChatSidebar = ({
	visibility,
	onClose,
	onSearch,
	setSearchFlag,
	session,
}) => {
	const [images, setImages] = useState([]);
	const [files, setFiles] = useState([]);
	const [imgsFlag, setImgsFlag] = useState(false);
	const [filesFlag, setFilesFlag] = useState(false);
	const [popupImage, setPopupImage] = useState();
	const [skip, setSkip] = useState(0);
	const [plus, setPlus] = useState(true);
	const limit = 3;
	useEffect(() => {
		if (imgsFlag) {
			getContentFromSession(session._id, 'image', { limit, skip })
				.then(({ data }) => {
					setImages([...images, ...data]);
					if (!data.length) setPlus(false);
				})
				.catch((err) => console.log(err));
		} else if (filesFlag) {
			getContentFromSession(session._id, 'text', { limit, skip })
				.then(({ data }) => {
					setFiles([...files, ...data]);
					if (!data.length) setPlus(false);
				})
				.catch((err) => console.log(err));
		}
	}, [skip]);
	useEffect(() => {
		const fetchContent = () => {
			if (imgsFlag) {
				if (skip) {
					return setTimeout(fetchContent, 100);
				}
				getContentFromSession(session._id, 'image', { limit, skip })
					.then(({ data }) => {
						setImages([...images, ...data]);
					})
					.catch((err) => console.log(err));
			}
		};
		if (imgsFlag) fetchContent();
		return () => {
			setPlus(true);
			setImages([]);
			setSkip(0);
		};
	}, [imgsFlag]);

	useEffect(() => {
		const fetchContent = () => {
			if (filesFlag) {
				if (skip) {
					return setTimeout(fetchContent, 100);
				}
				getContentFromSession(session._id, 'text', { limit, skip })
					.then(({ data }) => {
						setFiles([...files, ...data]);
					})
					.catch((err) => console.log(err));
			}
		};
		if (filesFlag) fetchContent();
		return () => {
			setPlus(true);
			setFiles([]);
			setSkip(0);
		};
	}, [filesFlag]);

	var imgsList;
	if (images != null && images.length > 0) {
		imgsList = images.map((el) => {
			return (
				<div className="imgWrapper">
					<img
						onClick={({ target: { src } }) => {
							setPopupImage(src);
						}}
						className="sidebar-image"
						src={`data:image/png;base64, ${el.content}`}
						style={{ width: '100%' }}
					/>
				</div>
			);
		});
	}
	// const showImage = () => {
	// 	return (
	// 		<div className="popup-container">
	// 			<div
	// 				className="popupWrapper"
	// 				onClick={() => {
	// 					setImagePopup(false);
	// 				}}
	// 			>
	// 				<img
	// 					className="popup-image"
	// 					src={`data:image/png;base64, ${content}`}
	// 				/>
	// 			</div>
	// 		</div>
	// 	);
	// };
	var filesList;
	if (files != null && files.length > 0) {
		filesList = files.map((el) => {
			return (
				<div className="item">
					<a
						href={`data:text/plain;charset=utf-8, ${el.content}`}
						download={`${el.fileName ? el.fileName : 'unknown.txt'}`}
					>
						<div className="fileWrapper">
							<div className="fileIconWrapper">
								<i className="file icon"></i>
							</div>
							<label style={{ cursor: 'pointer', margin: '3%' }}>
								{' '}
								{`${el.fileName ? el.fileName : 'unknown.txt'}`}
							</label>
						</div>
					</a>
				</div>
			);
		});
	} else {
		filesList = null;
	}
	const showImage = () => {
		return popupImage ? (
			<div className="settings-popup popup-container">
				<div
					className="popupWrapper"
					onClick={() => {
						setPopupImage(null);
					}}
				>
					<img className="popup-image" src={`${popupImage}`} />
				</div>
			</div>
		) : (
			''
		);
	};
	return (
		<>
			<div className="chat-settings">
				{' '}
				<div className="exit-button">
					{popupImage ? showImage() : ''}
					<i
						className="large close icon"
						style={{ cursor: 'pointer', margin: '2%' }}
						onClick={() => onClose()}
					></i>
				</div>
				<div className="chat-settings-content-wrapper">
					<div className="list">
						{' '}
						<div className="item">
							<div
								className="listItem"
								onClick={() => {
									setSearchFlag(true);
									onClose();
								}}
							>
								<div className="iconWrapper">
									<i class="search icon"></i>
								</div>
								<label style={{ cursor: 'pointer' }}>
									Search in conversation
								</label>
							</div>
						</div>
						<div className="item">
							<div
								className="listItem"
								onClick={() => {
									if (filesFlag) setFilesFlag(false);
									setImgsFlag(!imgsFlag);
								}}
							>
								<div className="iconWrapper">
									<i class="file image icon"></i>
								</div>
								<label style={{ cursor: 'pointer' }}>Shared media</label>
							</div>
						</div>
						<div className="item">
							<div
								className="listItem"
								onClick={() => {
									if (imgsFlag) setImgsFlag(false);
									setFilesFlag(!filesFlag);
								}}
							>
								<div className="iconWrapper">
									<i class="file icon"></i>
								</div>
								<label style={{ cursor: 'pointer' }}>Shared files</label>
							</div>
						</div>
					</div>
					{imgsFlag ? (
						<>
							{' '}
							<div className="settings-list-container">
								<div
									className="images"
									onScroll={() => {
										console.log('scrolled');
									}}
								>
									{imgsList}
								</div>
								{plus ? (
									<div className="settings-plus-icon">
										<i
											class="big plus icon"
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
						</>
					) : (
						''
					)}
					{filesFlag ? (
						<>
							{' '}
							<div className="settings-list-container">
								<div class="ui middle aligned divided list files-list">
									{filesList}
								</div>
								{plus ? (
									<div className="settings-plus-icon">
										<i
											class="big plus icon"
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
						</>
					) : (
						''
					)}
				</div>
			</div>
		</>
	);
	// <Sidebar.Pushable as={Segment}>
	// 	<Sidebar
	// 		as={Menu}
	// 		animation="overlay"
	// 		icon="labeled"
	// 		inverted
	// 		vertical
	// 		{...visibility}
	// 		width="thin"
	// 	>
	// 		<Menu.Item as="a">
	// 			<Icon name="home" />
	// 			Home
	// 		</Menu.Item>
	// 		<Menu.Item as="a">
	// 			<Icon name="gamepad" />
	// 			Games
	// 		</Menu.Item>
	// 		<Menu.Item as="a">
	// 			<Icon name="camera" />
	// 			Channels
	// 		</Menu.Item>
	// 	</Sidebar>

	// 	{/* <Sidebar.Pusher>
	// 		<Segment basic>
	// 			<Header as="h3">Application Content</Header>
	// 			<Image src="https://react.semantic-ui.com/images/wireframe/paragraph.png" />
	// 		</Segment>
	// 	</Sidebar.Pusher> */}
	// </Sidebar.Pushable>
};

export default ChatSidebar;
