import react, { useEffect } from "react";
import { useState } from "react";
import ListOfItems from "../components/List/ListOfItems";
import Item from "../components/Card/Item";
import { List } from "semantic-ui-react";
import { AvatarGenerator } from "random-avatar-generator";
import { url } from "../constants/constants";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import {
  getGroupMembers,
  getGroup,
  updateGroup,
  removeUserFromGroup,
  uploadPicture,
  deleteGroup,
} from "../API";
import "../styles/Groups.css";
const generator = new AvatarGenerator();

function Group({ id, setGroupMembers }) {
  var history = useHistory();
  const [items, setItems] = useState([]);
  const [group, setGroup] = useState();
  const [popupFlag, setPopupFlag] = useState(false);
  const [groupAvatar, setGroupAvatar] = useState();
  const updateItems = () => {
    getGroupMembers(id)
      .then(({ data }) => {
        setItems(data);
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    updateItems();
  }, []);
  useEffect(() => {
    getGroup(id)
      .then(({ data }) => {
        console.log(data);
        setGroupAvatar(data.avatar);
        setGroup(data);
      })
      .catch((err) => console.log(err));
  }, [id]);
  const emptyButton = {
    onClick: () => {
      console.log("THATS YOU!!!");
    },
    text: "That's you",
    color: "blue !important;",
  };
  const button = {
    onClick: (id) => {
      removeUserFromGroup(group, id)
        .then(({ data }) => {
          setGroupMembers(data);
        })
        .catch((err) => console.log(err));
    },
    text: "Remove from a group",
  };
  // if (file && file.value) {
  // 	const pictureFormData = new FormData();
  // 	console.log('PROFIL IMG ADD');
  // 	pictureFormData.append('profileImg', file.files[0]);
  // 	pictureFormData.append('groupId');
  // 	pictureFormData.append('setProfilePicture', true);
  // 	uploadPicture(pictureFormData)
  // 		.then(({ data }) => {
  // 			console.log(data);
  // 		})
  // 		.catch((err) => console.log(err));
  // }
  const onDeleteGroup = async () => {
    deleteGroup(id)
      .then(() => {
        history.push("/Home/Groups");
      })
      .catch((error) => console.log(error));
    setPopupFlag(false);
  };
  const popupForm = () => {
    return (
      <div className="popup-container">
        {" "}
        <div className="popupWrapper">
          <div class="ui card">
            <div class="content">
              <div className="headerWrapper">Are you sure?</div>
            </div>
            <div class="ui two bottom attached buttons">
              <div
                class="ui button"
                onClick={() => {
                  setPopupFlag(false);
                }}
              >
                No
              </div>
              <div class="ui red button" onClick={onDeleteGroup}>
                Yes
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const onSubmitUpdate = async (event) => {
    event.preventDefault();
    const {
      target: { name, file },
    } = event;
    if (name.value || (file && file.value)) {
      const formData = new FormData();
      const group = {};
      if (name.value != "") {
        group.name = name.value;
        const response = await updateGroup(id, group);
        if (response && response.status == 200) {
          const { data: group } = response;
          setGroup(group);
        }
      }
      if (file && file.value) {
        const pictureFormData = new FormData();
        pictureFormData.append("profileImg", file.files[0]);
        pictureFormData.append("setProfilePicture", true);
        pictureFormData.append("groupId", id);
        uploadPicture(pictureFormData)
          .then(({ data }) => {
            setGroupAvatar(data);
          })
          .catch((err) => console.log(err));
      }
    } else alert("Morate uneti bar jedan podatak za azuriranje.");
  };

  return (
    <div className="group-page-wrapper">
      <div className="formWrapper">
        <div className="settings-wrapper">
          <form
            id="test"
            class="ui form"
            method="PATCH"
            onSubmit={onSubmitUpdate}
          >
            <h4 class="ui center aligned top attached header">
              Make changes to group.
            </h4>
            <div id="form-segment" class="ui center aligned attached segment">
              <div class="field">
                <label for="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder={group ? group.name : "name"}
                />
              </div>
              <div class="field">
                <input name="file" type="file" onChange={(e) => {}} />
              </div>
            </div>
            <button class="ui bottom attached fluid button" type="submit">
              Update
            </button>
          </form>
          {popupFlag ? popupForm() : ""}
          <button
            class="red ui bottom attached fluid button"
            onClick={() => {
              if (!popupFlag) setPopupFlag(true);
            }}
          >
            Delete group
          </button>
        </div>
      </div>
      <div className="group-wrapper">
        <div className="lblNameWrapper">
          <div className="user-label-wrapper">
            <div className="avatar-wrapper label">
              <img
                className="avatar"
                src={
                  groupAvatar
                    ? `data:image/png;base64, ${groupAvatar.picture}`
                    : `${url}/img/nopic.jpg`
                }
              />
            </div>
            <div className="username-wrapper label">
              {group ? group.name : ""}
            </div>
            <div style={{ visibility: "hidden" }}>
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
          </div>
          {group ? (
            group.adminIds.some(
              (adminId) => adminId == localStorage.getItem("id")
            ) ? (
              <button
                class="large ui button"
                id="add-member-button"
                style={{ "margin-top": "4%" }}
                onClick={() => {
                  setGroupMembers(id);
                  history.push("/Home/Users");
                }}
              >
                <i class="users icon"></i>
                Add members
              </button>
            ) : (
              ""
            )
          ) : (
            ""
          )}
        </div>

        <List>
          {items.map((item) => (
            <List.Item key={item.id}>
              <Item
                onSelect={() => {}}
                button={
                  group.adminIds.some(
                    (adminId) => adminId == localStorage.getItem("id")
                  )
                    ? item.id == localStorage.getItem("id")
                      ? {}
                      : button
                    : {}
                }
                {...item}
              ></Item>
            </List.Item>
          ))}
        </List>
      </div>
    </div>
  );
}

export default Group;
