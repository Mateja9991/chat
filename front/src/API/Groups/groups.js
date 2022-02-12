import { url } from "../../constants/constants";
import axios from "axios";
import { token } from "../utils";

const createGroup = async (group) =>
  axios.post(`${url}/groups`, group, {
    headers: { Authorization: `Bearer ${token()}` },
  });

const getGroup = async (groupId) =>
  axios.get(`${url}/groups/${groupId}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });

const getGroupMessageHistory = async (groupId, { limit, skip }) =>
  axios.get(`${url}/groups/${groupId}/get-message-history`, {
    headers: { Authorization: `Bearer ${token()}` },
    params: { limit, skip },
  });

const getAllUsersGroups = ({ limit, skip }) =>
  axios.get(`${url}/groups/me`, {
    headers: { Authorization: `Bearer ${token()}` },
    params: { limit, skip },
  });

const updateGroup = async (groupId, group) =>
  axios.patch(`${url}/groups/${groupId}`, group, {
    headers: { Authorization: `Bearer ${token()}` },
  });

const deleteGroup = (groupId) =>
  axios.delete(`${url}/groups/${groupId}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });

export {
  createGroup,
  getGroup,
  getAllUsersGroups,
  getGroupMessageHistory,
  updateGroup,
  deleteGroup,
};
