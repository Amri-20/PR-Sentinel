import api from "./api";

export const getRepositories = () => api.get("/github/repos");
