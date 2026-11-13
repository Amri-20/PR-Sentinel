import { getGitHubClient } from "../services/github.services.js";
import {
  saveSelectedRepository,
  getSelectedRepositories,
  removeSelectedRepository,
} from "../services/repository.service.js";
import { ApiError } from "../utils/ApiError.js";

const selectRepository = async (req, res, next) => {
  try {
    const { owner, repo } = req.body;

    if (!owner || !repo) {
      throw new ApiError(400, "Owner and repository name are required");
    }

    const github = await getGitHubClient(req.userId);

    const repositoryData = await github(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    );
    const repository = await saveSelectedRepository(req.userId, repositoryData);

    return res.status(200).json({
      success: true,
      message: "Repository selected successfully",
      repository,
    });
  } catch (error) {
    next(error);
  }
};

const getSelectedRepositoryController = async (req, res, next) => {
  try {
    const repositories = await getSelectedRepositories(req.userId);

    return res.status(200).json({
      success: true,
      count: repositories.length,
      repositories,
    });
  } catch (error) {
    next(error);
  }
};

const deleteSelectedRepository = async (req, res, next) => {
  try {
    const { id } = req.params;
    const repository = await removeSelectedRepository(req.userId, id);

    return res.status(200).json({
      success: true,
      message: "Repository removed successfully",
      repository,
    });
  } catch (error) {
    next(error);
  }
};

export {
  selectRepository,
  getSelectedRepositoryController,
  deleteSelectedRepository,
};
