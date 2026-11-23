import api from "./api";

export const getCurrentUser = () => api.get("/auth/me");
export const logout = () => api.get("/auth/logout");
