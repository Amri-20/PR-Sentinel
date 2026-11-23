import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getPullRequestReview,
  getRepositoryReviewHistory,
  reviewPullRequest,
} from "../controllers/review.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.post("/:owner/:repo/pulls/:number", reviewPullRequest);
router.get("/:owner/:repo/pulls/:number", getPullRequestReview);
router.get("/:owner/:repo", getRepositoryReviewHistory);

export default router;
