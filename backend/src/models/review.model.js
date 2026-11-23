import mongoose from "mongoose";

const findingSchema = new mongoose.Schema(
  {
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low", "info"],
      required: true,
    },
    category: {
      type: String,
      enum: ["bug", "security", "performance", "quality"],
      required: true,
    },
    file: {
      type: String,
      required: true,
    },
    line: {
      type: Number,
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    suggestedFix: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const fileReviewSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "skipped"],
      required: true,
    },
    reason: {
      type: String,
      default: null,
    },
    summary: {
      type: String,
      default: null,
    },
    findings: {
      type: [findingSchema],
      default: [],
    },
  },
  { _id: false },
);

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    owner: {
      type: String,
      required: true,
    },
    repository: {
      type: String,
      required: true,
    },
    pullRequestNumber: {
      type: Number,
      required: true,
    },
    results: {
      type: [fileReviewSchema],
      default: [],
    },
  },
  { timestamps: true },
);

reviewSchema.index(
  { user: 1, owner: 1, repository: 1, pullRequestNumber: 1 },
  { unique: true },
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
