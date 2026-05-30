import http from "./http";
import type { Car } from "../types/car";

export const getCarsByUserId = (userId: number) =>
  http.get(`/cars/users/${userId}/cars`);

export const createCarForUser = (userId: number, car: Omit<Car, "id">) =>
  http.post(`/cars/users/${userId}/cars`, car);

export const updateCar = (id: number, car: Car) =>
  http.put(`/cars/${id}`, car);

export const deleteCar = (id: number) => http.delete(`/cars/${id}`);
