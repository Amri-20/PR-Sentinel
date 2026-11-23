import { getGitHubClient } from "../services/github.services.js";
import { runCodeReview } from "../services/ai.service.js";
import { ApiError } from "../utils/ApiError.js";
import Review from "../models/review.model.js";
import {
  saveReview,
  getReviewByPR,
  getRepositoryReviews,
} from "../services/review.service.js";

const reviewPullRequest = async (req, res, next) => {
  try {
    const { owner, repo, number } = req.params;
    if (!/^\d+$/.test(number)) {
      throw new ApiError(400, "Invalid pull request number");
    }

    const github = await getGitHubClient(req.userId);

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

    const savedReview = await saveReview(
      req.userId,
      owner,
      repo,
      Number(number),
      reviewResults,
    );

    const persistedResults = reviewResults.map((result) => ({
      filename: result.filename,
      status: result.status,
      reason: result.reason || null,
      summary: result.review?.summary || null,
      findings: (result.review?.findings || []).map((finding) => ({
        severity: finding.severity,
        category: finding.category,
        file: finding.file,
        line: finding.line,
        title: finding.title,
        description: finding.description,
        suggestedFix: finding.suggested_fix,
      })),
    }));

    await Review.findOneAndUpdate(
      {
        user: req.userId,
        owner,
        repository: repo,
        pullRequestNumber: Number(number),
      },
      { $set: { results: persistedResults } },
      { new: true, upsert: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: "Pull request review completed",
      reviewId: savedReview._id,
      pullRequest: {
        owner,
        repo,
        number: Number(number),
      },
      count: reviewResults.length,
      results: reviewResults,
    });
  } catch (error) {
    next(error);
  }
};

const getPullRequestReview = async (req, res, next) => {
  try {
    const { owner, repo, number } = req.params;

    if (!/^\d+$/.test(number)) {
      throw new ApiError(400, "Invalid pull request number");
    }

    const review = await getReviewByPR(req.userId, owner, repo, Number(number));

    return res.status(200).json({
      success: true,
      message: "Pull request review fetched successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
};

const getRepositoryReviewHistory = async (req, res, next) => {
  try {
    const { owner, repo } = req.params;

    const reviews = await getRepositoryReviews(req.userId, owner, repo);

    return res.status(200).json({
      success: true,
      message: "Repository review history fetched successfully",
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

export { reviewPullRequest, getPullRequestReview, getRepositoryReviewHistory };
