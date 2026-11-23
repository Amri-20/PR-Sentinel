import mongoose from "mongoose";

const findingSchema = new mongoose.Schema(
  {
    severity: String,
    category: String,
    file: String,
    line: Number,
    title: String,
    description: String,
    suggested_fix: String,
  },
  { _id: false },
);

const fileReviewSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    status: { type: String, enum: ["completed", "skipped", "failed"], required: true },
    reason: String,
    review: {
      summary: String,
      findings: { type: [findingSchema], default: [] },
    },
  },
  { _id: false },
);

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: String, required: true },
    repo: { type: String, required: true },
    pullRequestNumber: { type: Number, required: true },
    status: { type: String, enum: ["completed", "partial", "failed"], required: true },
    results: { type: [fileReviewSchema], default: [] },
  },
  { timestamps: true },
);

reviewSchema.index(
  { user: 1, owner: 1, repo: 1, pullRequestNumber: 1 },
  { unique: true },
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
