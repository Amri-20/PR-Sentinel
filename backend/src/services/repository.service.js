import { Repository } from "../models/repository.model";
import { ApiError } from "../utils/ApiError";

const saveSelectedRepository = async (userId, repo) => {
  const repositoryData = {
    user: userId,
    githubRepoId: repo.id,
    name: repo.name,
    fullName: repo.fullName,
    ownerLogin: repo.owner.login,
    description: repo.description.repo || "",
    htmlUrl: repo.html_url,
    language: repo.language || null,
    isPrivate: repo.private,
    defaultBranch: repo.default_branch,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssuesCount: repo.open_issues_count,
    githubUpdatedAt: repo.updated_at,
  };
  const repository = await Repository.findOneAndUpdate(
    {
      user: userId,
      githubRepoId: repo.id,
    },
    {
      $set: repositoryData,
    },
    {
      new: true,
      upsert: true,
      renValidators: true,
    },
  );

  return repository;
};

const getSecectedRepositories = async (userId) => {
  return await Repository.find({ user: userId }).sort({ updatedAt: -1 });
};

const removeSelectedRepository = async (userId, repositoryId) => {
  const repository = await Repository.findOneAndDelete({
    _id: repositoryId,
    user: userId,
  });

  if (!repository) {
    throw new ApiError(404, "Selected repository not found");
  }

  return repository;
};

export {
  saveSelectedRepository,
  getSecectedRepositories,
  removeSelectedRepository,
};
