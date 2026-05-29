import { apiClient } from "./client";
import type { components } from "./schema";

export type UserResponseDto = components["schemas"]["UserResponseDto"];
export type UpdateUserDto = components["schemas"]["UpdateUserDto"];

export const usersApi = {
  getMe: () => apiClient.GET("/users/me"),
  updateMe: (body: UpdateUserDto) => apiClient.PUT("/users/me", { body }),
  deleteMe: () => apiClient.DELETE("/users/me"),
  getAll: () => apiClient.GET("/users"),
  remove: (id: string) =>
    apiClient.DELETE("/users/{id}", { params: { path: { id } } }),
};
