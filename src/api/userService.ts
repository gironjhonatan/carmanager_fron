import http from "./http";
import type { User } from "../types/user";

export const getUsers = () => http.get("/users");

export const createUser = (user: Omit<User, "id">) =>
  http.post("/users", user);

export const updateUser = (id: number, user: User) =>
  http.put(`/users/${id}`, user);

export const deleteUser = (id: number) => http.delete(`/users/${id}`);