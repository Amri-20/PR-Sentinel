import api from "./api";

export const getRepositories = () => api.get("/v1/github/repos");
