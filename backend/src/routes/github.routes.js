import express, { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getRepositories,
  getPullRequests,
  getPullRequestFiles,
} from "../controllers/github.controllers.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/repos", getRepositories);
router.get("/repos/:owner/:repo/pulls", getPullRequests);
router.get("/repos/:owner/:repo/pulls/:number/files", getPullRequestFiles);

export default router;
