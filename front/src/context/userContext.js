import React, { useState, createContext } from "react";

export const UserContext = createContext();

export const UserProvider = (props) => {
  const [userInfo, setUserInfo] = useState({
    id: "",
    token: "",
    username: "",
  });

  return (
    <UserContext.Provider value={[userInfo, setUserInfo]}>
      {props.children}
    </UserContext.Provider>
  );
};
