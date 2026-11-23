import Review from "../models/review.model.js";
import { ApiError } from "../utils/ApiError.js";

const saveReview = async (
  userId,
  owner,
  repository,
  pullRequestNumber,
  results
) => {
  const formattedResults = results.map((item) => ({
    filename: item.filename,
    status: item.status,
    reason: item.reason || null,
    summary: item.review?.summary || null,
    findings: (item.review?.findings || []).map((finding) => ({
      severity: finding.severity,
      category: finding.category,
      file: finding.file,
      line: finding.line ?? null,
      title: finding.title,
      description: finding.description,
      suggestedFix: finding.suggested_fix,
    })),
  }));

  const review = await Review.findOneAndUpdate(
    {
      user: userId,
      owner,
      repository,
      pullRequestNumber,
    },
    {
      $set: {
        results: formattedResults,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );

  return review;
};

const getReviewByPR = async (
  userId,
  owner,
  repository,
  pullRequestNumber
) => {
  const review = await Review.findOne({
    user: userId,
    owner,
    repository,
    pullRequestNumber,
  });

  if (!review) {
    throw new ApiError(404, "Pull request review not found");
  }

  return review;
};

const getRepositoryReviews = async (userId, owner, repository) => {
  return await Review.find({
    user: userId,
    owner,
    repository,
  }).sort({ updatedAt: -1 });
};

export {
  saveReview,
  getReviewByPR,
  getRepositoryReviews,
};
