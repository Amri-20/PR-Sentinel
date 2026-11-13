import { Repository } from "../models/repository.model.js";
import { ApiError } from "../utils/ApiError.js";

const saveSelectedRepository = async (userId, repo) => {
  const repositoryData = {
    user: userId,
    githubRepoId: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    ownerLogin: repo.owner.login,
    description: repo.description || "",
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
      runValidators: true,
    },
  );

  return repository;
};

const getSelectedRepositories = async (userId) => {
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
  getSelectedRepositories,
  removeSelectedRepository,
};
