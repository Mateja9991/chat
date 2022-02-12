import React, { useState, useContext, useEffect, useRef } from "react";
import { ListOfItems } from "../components/List";
import Item from "../components/Card/Item";
import { List } from "semantic-ui-react";
import { getAllUsers, sendFriendRequest } from "../API";
import Circle from "../components/Animation/Circle";
import SearchUsers from "../components/SearchUsers";
import { sendGroupInvitation } from "../API/Users/groups";
function UsersPage({ checkUser, searchTerm, group, setGroup }) {
  // const [items, setItems] = useState([]);
  // const [skip, setSkip] = useState(0);
  // const [plus, setPlus] = useState(true);
  // const inputRef = useRef(null);
  // const limit = 3;
  const addFriendButton = {
    icon: `big plus icon`,
    onClick: (id) => {
      sendFriendRequest(id)
        .then(({ data }) => {})
        .catch((err) => console.log(err));
    },
    text: "Add Friend",
  };
  const addMemberButton = {
    icon: `big plus icon`,
    onClick: (id) => {
      sendGroupInvitation(group, id)
        .then(({ data }) => {})
        .catch((err) => console.log(err));
    },
    text: "Add Member",
  };
  useEffect(() => {
    return () => {
      setGroup(null);
    };
  }, []);
  return (
    <SearchUsers
      checkUser={checkUser}
      searchTerm={searchTerm}
      group={group}
      setGroup={setGroup}
      button={group ? addMemberButton : addFriendButton}
    />
  );
  // setTimeout(() => console.log(inputRef.current.value), 2000);

  // const updateItems = async () => {
  // 	getAllUsers({ limit, skip, searchTerm: 'username', username: searchTerm })
  // 		.then(({ data }) => {
  // 			if (items != null) setItems(items.concat(data));
  // 			else setItems(data);
  // 			if (data.length < limit) setPlus(false);
  // 		})
  // 		.catch((err) => console.log(err));
  // };

  // useEffect(() => {
  // 	updateItems();
  // }, [skip, searchTerm]);
  // const firstCircle = {
  // 	position: 'absolute',
  // 	top: '-50%',
  // 	right: '-86%',
  // };
  // const secondCircle = {
  // 	position: 'absolute',
  // 	top: '85%',
  // 	right: '130%',
  // 	transform: 'rotate(60deg)',
  // };
  // return (
  // 	<>
  // 		<div className="welcomeText">{'welcomeText'}</div>
  // 		<List>
  // 			{items.map((item) => (
  // 				<List.Item key={item.id}>
  // 					<Item
  // 						onSelect={checkUser}
  // 						button={group ? addMemberButton : addFriendButton}
  // 						{...item}
  // 					></Item>
  // 				</List.Item>
  // 			))}
  // 		</List>
  // 		<div className="plusIconWrapper">
  // 			{plus ? (
  // 				<i
  // 					class="big plus circle icon"
  // 					style={{ cursor: 'pointer' }}
  // 					onClick={() => setSkip(skip + limit)}
  // 				></i>
  // 			) : (
  // 				''
  // 			)}
  // 			<div>
  // 				<Circle style={firstCircle} color={'#50fa7b'} />
  // 			</div>
  // 			<div>
  // 				<Circle style={secondCircle} color={'#ff79c6'} />
  // 			</div>
  // 		</div>
  // 	</>
  // );
}

export default UsersPage;
