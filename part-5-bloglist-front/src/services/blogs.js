import axios from "axios";
const baseUrl = "/api/blogs";

let token = null;

const setToken = (newToken) => {
  token = `Bearer ${newToken}`;
};

const getAll = () => {
  return axios.get(baseUrl).then((res) => res.data);
};

const create = (o) => {
  const config = {
    headers: { Authorization: token },
  };
  return axios.post(baseUrl, o, config).then((res) => res.data);
};

const update = (id, o) => {
  const config = {
    headers: { Authorization: token },
  };
  return axios.put(`${baseUrl}/${id}`, o, config).then((res) => res.data);
};

const remove = (id) => {
  const config = {
    headers: { Authorization: token },
  };
  return axios.delete(`${baseUrl}/${id}`, config).then((res) => res.data);
};

export default { getAll, create, update, remove, setToken };
