import react, { useEffect, useRef, useState } from 'react';
import '../../styles/Chat.css';
import Item from '../../components/Card/Item';
import Contact from './Contact';
import { useWhatChanged } from '@simbathesailor/use-what-changed';
import { useSocket } from '../../context/socketProvider';
import {
	getUserByUsername,
	getUserById,
	getCurrentUsersFriends,
	getContacts,
} from '../../API';

function usePrevious(value) {
	const ref = useRef(value);

	useEffect(() => {
		ref.current = value;
	});

	return ref.current;
}
function ListOfContacts({ searchValue, selected, setSelected }) {
	const [contacts, setContacts] = useState([]);
	const [skip, setSkip] = useState(0);
	const socket = useSocket();
	const [plus, setPlus] = useState(true);
	const limit = 6;
	useEffect(() => {
		updateItems();
	}, [skip, searchValue]);
	useEffect(() => {
		return () => {
			setContacts([]);
		};
	}, []);
	useEffect(() => {
		if (socket)
			socket.on('new-message', async (payload) => {
				const {
					sessionKey,
					user: { username: senderUsername },
					message: { text },
				} = payload;
				if (sessionKey == localStorage.getItem('id')) return;
				if (selected && sessionKey == selected.id) return;
				if (
					contacts.filter((contact) => {
						return contact.id == sessionKey;
					}).length
				) {
					setContacts([
						contacts.reduce((acc, contact) => {
							if (contact.id == sessionKey) {
								return {
									...contact,
									numOfUnreadMessages: contact.numOfUnreadMessages + 1,
									messagePart: `${text.slice(0, 13)}${
										text.length > 13 ? '...' : ''
									}`,
								};
							}
							return acc;
						}, {}),
						...contacts.filter((contact) => contact.id != sessionKey),
					]);
				} else {
					const { data: newContact } = await getUserById(sessionKey).catch(
						(err) => {
							console.log(err);
						}
					);
					if (newContact)
						setContacts([
							{
								numOfUnreadMessages: 1,
								messagePart: `${text.slice(0, 13)}${
									text.length > 13 ? '...' : ''
								}`,
								...newContact,
							},
							...contacts,
						]);
				}
			});
		return () => {
			if (socket) socket.off('new-message');
		};
	}, [contacts]);

	var contactList;
	const updateItems = async () => {
		getContacts({ limit, skip, searchValue })
			.then(({ data }) => {
				console.log('data is:');
				console.log(data);
				if (contacts != null)
					setContacts(
						contacts.concat(
							data.map(({ contact, newMessages }) => ({
								numOfUnreadMessages: newMessages,
								messagePart: '',
								...contact,
							}))
						)
					);
				else
					setContacts(
						data.map(({ contact, newMessages }) => ({
							numOfUnreadMessages: newMessages,
							messagePart: '',
							...contact,
						}))
					);
				if (data.length < limit) setPlus(false);
			})
			.catch((err) => console.log(err));
	};
	useEffect(() => {
		setContacts(
			contacts.map((contact) => {
				if (contact.id == selected.id) {
					return {
						...contact,
						numOfUnreadMessages: 0,
						messagePart: '',
					};
				}
				return contact;
			})
		);
	}, [selected]);
	if (contacts != null) {
		contactList = contacts.map((session) => {
			return (
				<Contact
					key={session.id}
					name={session.name}
					session={session}
					avatar={session.avatar}
					active={session.active}
					messagePart={session.messagePart}
					numOfUnreadMessages={session.numOfUnreadMessages}
					setSelected={setSelected}
				/>
			);
		});
	} else contactList = '';
	return (
		<>
			<div className="contactsWrapper">{contactList}</div>{' '}
			<div className="plusIconWrapper">
				{plus ? (
					<i
						class="big plus icon"
						style={{ cursor: 'pointer' }}
						onClick={() => setSkip(skip + limit)}
					></i>
				) : (
					''
				)}
			</div>
		</>
	);
}
function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;

	// If you don't care about the order of the elements inside
	// the array, you should sort both arrays here.
	// Please note that calling sort on an array will modify that array.
	// you might want to clone your array first.

	for (var i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}
function Contacts({ setSelected, selected, session }) {
	const inputRef = useRef();
	const socket = useSocket();
	const [searchValue, setSearchValue] = useState();
	const [searchFlag, setSearchFlag] = useState();
	useEffect(() => {
		setSearchFlag(false);
		setTimeout(() => {
			setSearchFlag(true);
		}, 50);
	}, [searchValue]);
	return (
		<div className="contacts-container">
			<div className="search-contact">
				<div class="ui input">
					<input
						type="text"
						placeholder="Enter contact username"
						ref={inputRef}
						onKeyDown={(e) => {
							console.log(e.key);
							if (e.key == 'Enter') {
								console.log(`setting ${e.target.value}`);
								setSearchValue(e.target.value);
							}
						}}
					/>
				</div>
			</div>
			{searchFlag ? (
				<ListOfContacts
					selected={selected}
					setSelected={setSelected}
					searchValue={searchValue}
				></ListOfContacts>
			) : (
				''
			)}
		</div>
	);
}

export default Contacts;

/*
 return (
		<div className="contacts-container">
			<div className="search-contact">
				<div class="ui input">
					<input
						type="text"
						placeholder="Enter contact username"
						ref={inputRef}
						onKeyDown={({ target: { value } }) => {
							console.log(value);
						}}
					/>
				</div>
			</div>
			<div className="contactsWrapper">{contactList}</div>
		</div>
	);
*/
