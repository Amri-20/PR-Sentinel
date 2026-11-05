import { getGitHubClient } from "../services/github.services";
import {
  saveSelectedRepository,
  getSecectedRepositories,
  removeSelectedRepository,
} from "../services/repository.service";
import { ApiError } from "../utils/ApiError";

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

    return req.status(200).json({
      sucess: true,
      message: "Repository selected successfully",
      repository,
    });
  } catch (error) {
    next(error);
  }
};

const getSelectedRepositoryController = async (req, res, next) => {
  try {
    const repositories = await getSecectedRepositories(Request.userId);

    return res.status(200).json({
      sucess: true,
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
      sucesstrue,
      message: "Repository removed successfully",
      repository,
    });
  } catch (error) {
    next(error);
  }
};

return {
  selectRepository,
  getSelectedRepositoryController,
  deleteSelectedRepository,
};
