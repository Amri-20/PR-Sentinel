import api from "./api";

export const getPullRequests = (repository) => api.get(`/v1/github/repos/${encodeURIComponent(repository.owner.login)}/${encodeURIComponent(repository.name)}/pulls`);
export const getPullRequestFiles = (repository, pullRequest) => api.get(`/v1/github/repos/${encodeURIComponent(repository.owner.login)}/${encodeURIComponent(repository.name)}/pulls/${pullRequest.number}/files`);
export const reviewPullRequest = (repository, pullRequest) => api.post(`/v1/reviews/${encodeURIComponent(repository.owner.login)}/${encodeURIComponent(repository.name)}/pulls/${pullRequest.number}`);
