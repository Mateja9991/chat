import { useEffect, useState } from "react";
import { useHistory, Switch, Route } from "react-router-dom";
import { Login, Register } from "./pages";
import MainWrapper from "./pages/MainWrapper";
//import './components/styles/App.css';
import useStorage from "./common/storage";
import { SocketProvider } from "./context/socketProvider";
import { registerUser } from "./API";

function MainForm() {
  const { storage, setStorage } = useStorage();
  const { token, ...user } = storage;
  let history = useHistory();

  const LoginForm = () => <Login setStorage={setStorage} />;
  const MainWrapperWrapper = () => <MainWrapper user={{ ...user }} />;

  const RegisterForm = () => (
    <Register
      onSubmitRegister={async (event) => {
        event.preventDefault();
        const {
          target: { username, name, email, password },
        } = event;
        const user = {
          username: username.value,
          name: name.value,
          email: email.value,
          password: password.value,
        };
        const response = await registerUser(user);
        if (response && response.status == 200) {
          console.log(response);
          const {
            data: { user, token },
          } = response;
          setStorage({
            ...user,
            token,
          });
          history.push("/Home");
        }
      }}
    />
  );
  useEffect(() => {
    if (localStorage.getItem("token")) {
      history.push("/Home");
    }
  }, []);
  return (
    <>
      <Switch>
        <Route path="/Register" component={RegisterForm} />
        <Route path="/Home" component={MainWrapperWrapper} />
        <Route path="/" component={LoginForm} />
      </Switch>
      <script src="http://localhost:3001/socket.io/socket.io.js"></script>
    </>
  );
}

export default MainForm;
