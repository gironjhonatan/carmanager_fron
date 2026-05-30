import http from "../api/http";

export const loginRequest = (data: { email: string; password: string }) => {
  return http.post("/auth/login", data);
};

export const registerRequest = (data: any) => {
  return http.post("/auth/register", data);
};