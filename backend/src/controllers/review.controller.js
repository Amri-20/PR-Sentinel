import { getGitHubClient } from "../services/github.services.js";
import { runCodeReview } from "../services/ai.service.js";
import { ApiError } from "../utils/ApiError.js";
import Review from "../models/review.model.js";

const validatePullRequestParams = (owner, repo, number) => {
  if (!owner || !repo || !/^\d+$/.test(number)) {
    throw new ApiError(400, "Invalid repository or pull request number");
  }
};

const reviewPullRequest = async (req, res, next) => {
  try {
    const { owner, repo, number } = req.params;
    validatePullRequestParams(owner, repo, number);

    const github = await getGitHubClient(req.userId);

    const files = await github(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${number}/files?per_page=100`,
    );

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No changed files found in this pull request",
      });
    }

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

      try {
        const review = await runCodeReview(file.filename, file.patch);

        reviewResults.push({
          filename: file.filename,
          status: "completed",
          review,
        });
      } catch (error) {
        // A single unreviewable file should not discard completed reviews. The
        // failure is returned and persisted so it remains visible to the user.
        reviewResults.push({
          filename: file.filename,
          status: "failed",
          reason: error.message || "AI review failed",
        });
      }
    }

    const completedCount = reviewResults.filter(
      (result) => result.status === "completed",
    ).length;
    const reviewStatus =
      completedCount === reviewResults.length && reviewResults.length > 0
        ? "completed"
        : completedCount > 0
          ? "partial"
          : reviewResults.some((result) => result.status === "failed")
            ? "failed"
            : "partial";

    const savedReview = await Review.findOneAndUpdate(
      {
        user: req.userId,
        owner,
        repo,
        pullRequestNumber: Number(number),
      },
      {
        $set: {
          status: reviewStatus,
          results: reviewResults,
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: "Pull request review completed",
      pullRequest: {
        owner,
        repo,
        number: Number(number),
      },
      count: reviewResults.length,
      results: reviewResults,
      reviewId: savedReview._id,
      status: reviewStatus,
    });
  } catch (error) {
    next(error);
  }
};

const getPullRequestReview = async (req, res, next) => {
  try {
    const { owner, repo, number } = req.params;
    validatePullRequestParams(owner, repo, number);

    const review = await Review.findOne({
      user: req.userId,
      owner,
      repo,
      pullRequestNumber: Number(number),
    });

    if (!review) {
      throw new ApiError(404, "No saved review for this pull request");
    }

    return res.status(200).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

const getRepositoryReviewHistory = async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    if (!owner || !repo) {
      throw new ApiError(400, "Repository owner and name are required");
    }

    const reviews = await Review.find({ user: req.userId, owner, repo })
      .sort({ updatedAt: -1 })
      .limit(100);

    return res
      .status(200)
      .json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

export { reviewPullRequest, getPullRequestReview, getRepositoryReviewHistory };
