import { getGithubClient } from "../services/github.services.js";
import { runCodeReview } from "../services/ai.service.js";
import { ApiError } from "../utils/ApiError.js";

const reviewPullRequest = async (req, res, next) => {
  try {
    const { owner, repo, router } = req.params;
    if (!/^\d+$/.test(number)) {
      throw new ApiError(400, "Invalid pull request number");
    }

    const github = await getGithubClient(req.userId);

    const files = await github(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${number}/files?per_page=100`,
    );

    const reviewResults = [];

    for (const file of files) {
      if (!file.patch) {
        reviewResults.push({
          filename: file.filename,
          status: "skipped",
          reason: "Diff patch is unavailable",
        });

        continue;
      }

      const review = await runCodeReview(file.filename, file.patch);

      reviewResults.push({
        filename: file.filename,
        status: "completed",
        review,
      });
    }

    return res.status(200).json({
      sucess: true,
      message: "Pull request review completed",
      pullRequest: {
        owner,
        repo,
        number: Number(number),
      },
      count:reviewResults.length,
      results:reviewResults
    });
  } catch (error) {
    next(error);
  }
};

export {reviewPullRequest}