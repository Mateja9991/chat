import React, { useState, useContext, useEffect, useRef } from "react";
import { FriendList, FriendRequestList, ListOfItems } from "../components/List";
import Item from "../components/Card/Item";
import { List } from "semantic-ui-react";
import {
  getAllUsers,
  getFriendRequests,
  getCurrentUsersFriends,
  acceptFriendRequest,
  declineFriendRequest,
} from "../API";
import Circle from "../components/Animation/Circle";
import "../styles/Friends.css";
function FriendsPage({ checkUser }) {
  const [requests, setRequests] = useState(true);

  const firstCircle = {
    position: "absolute",
    top: "-50%",
    right: "-86%",
  };
  const secondCircle = {
    position: "absolute",
    top: "85%",
    right: "130%",
    transform: "rotate(60deg)",
  };
  const emptyBanner = (
    <div className="link-item item empty-banner">{`You have no ${
      requests ? "friend requests" : "friends"
    } at the moment :( `}</div>
  );
  return (
    <>
      <div className="friends-page-wrapper">
        <div className="friends-button-wrapper">
          <div
            onClick={() => (requests ? setRequests(false) : "")}
            className="friends friends-page-button"
          >
            <span>Friends</span>
          </div>
          <div
            onClick={() => (requests ? "" : setRequests(true))}
            set
            className="friend-requests friends-page-button"
          >
            <span> Friend Requests</span>
          </div>
        </div>
        {requests ? <FriendRequestList /> : <FriendList />}
        <div>
          <Circle style={firstCircle} color={"#50fa7b"} />
        </div>
        <div>
          <Circle style={secondCircle} color={"#ff79c6"} />
        </div>
      </div>
    </>
  );
}

export default FriendsPage;
