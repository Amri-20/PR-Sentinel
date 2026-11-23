import api from "./api";

const runPullRequestReview = (repository, pullRequest) =>
  api.post(
    `/reviews/${encodeURIComponent(repository.owner.login)}/${encodeURIComponent(repository.name)}/pulls/${pullRequest.number}`,
    {},
    { timeout: 180000 },
  );

const getPullRequestReview = (repository, pullRequest) =>
  api.get(
    `/reviews/${encodeURIComponent(repository.owner.login)}/${encodeURIComponent(repository.name)}/pulls/${pullRequest.number}`,
  );

const getRepositoryReviewHistory = (repository) =>
  api.get(
    `/reviews/${encodeURIComponent(repository.owner.login)}/${encodeURIComponent(repository.name)}`,
  );

export {
  runPullRequestReview,
  getPullRequestReview,
  getRepositoryReviewHistory,
};
