import axios from "axios";

const base = import.meta.env.VITE_API_BASE_URL || "https://gdg-interview-dashboard.onrender.com";

const api = axios.create({ baseURL: base });

export const getAllUsers = async () => {
  const res = await api.get("/users");
  return res.data?.data ?? res.data ?? [];
};

export const getUserById = async (id) => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

export const addRemark = async (id, remarkData) => {
  const res = await api.post(`/users/remarks/${id}`, remarkData);
  return res.data;
};

export const updateRemark = async (userId, remarkId, remarkData) => {
  const res = await api.put(`/users/${userId}/remarks/${remarkId}`, remarkData);
  return res.data;
};

export const deleteRemark = async (userId, remarkId) => {
  const res = await api.delete(`/users/${userId}/remarks/${remarkId}`);
  return res.data;
};
