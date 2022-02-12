import { useState } from 'react';

export default function useStorage() {
	let keys = [];
	function getStorage() {
		keys = localStorage.getItem('user_keys');
		keys = keys ? JSON.parse(keys) : [];
		return keys.reduce(
			(obj, key) => (obj[key] = localStorage.getItem(key)) && obj,
			{}
		);
	}

	const saveStorage = (user) => {
		keys = [];
		if (user && Object.keys(user).length == 0) {
			console.log(JSON.stringify([]));
			localStorage.setItem('user_keys', []);
		} else {
			Object.keys(user).forEach((key) => {
				console.log(user[key]);
				console.log(typeof user[key]);
				if (typeof user[key] !== 'string') return;
				keys.push(key);
				localStorage.setItem(key, user[key]);
			});
			localStorage.setItem('user_keys', JSON.stringify(keys));
		}
		setStorage(user);
	};

	//kad se refreshuje stranica vraca se na null
	const [storage, setStorage] = useState(getStorage());

	return {
		storage,
		setStorage: saveStorage,
	};
}
