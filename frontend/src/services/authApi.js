import api from "./api";

export const getCurrentUser = () => api.get("/v1/auth/me");
export const logout = () => api.post("/v1/auth/logout");
