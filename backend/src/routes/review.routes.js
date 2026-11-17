import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { reviewPullRequest } from "../controllers/review.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.post(":owner/:repo/pulls/:number", reviewPullRequest);

export default router;
