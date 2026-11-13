import api from "./api";

export const getPullRequests = (repository) => api.get(`/github/repos/${encodeURIComponent(repository.owner.login)}/${encodeURIComponent(repository.name)}/pulls`);
export const getPullRequestFiles = (repository, pullRequest) => api.get(`/github/repos/${encodeURIComponent(repository.owner.login)}/${encodeURIComponent(repository.name)}/pulls/${pullRequest.number}/files`);
