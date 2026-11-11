import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { decryptToken } from "../utils/tokenEncryption.utils.js";

const GITHUB_API = "https://api.github.com";

export const getGitHubClient = async (userId) => {
  const user = await User.findById(userId).select("+githubAccessToken");

  if (!user) {
    throw new ApiError(400, "Connected Github account not found");
  }

  const accessToken = decryptToken(user.githubAccessToken);

  return async (endpoint) => {
    const response = await fetch(`${GITHUB_API}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      const error = new ApiError(
        401,
        errorData.message || "Github API request failed",
      );

      error.statusCode = response.status;
      throw error;
    }

    return response.json();
  };
};
