import axios from "axios";

export const instance = axios.create({
  baseURL: "https://social-network.samuraijs.com/api/1.1/",
  withCredentials: true,
  headers: {
    "API-KEY": "24ab91d8-66ea-4f7f-ac6f-8f7f48b76f83",
  },
});
