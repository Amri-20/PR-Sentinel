import express from "express";
import {
  githubLogin,
  getCurrentUser,
  githubCallback,
  logout,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/github", githubLogin);
router.get("/github/callbck", githubCallback);
router.get("/me", verifyJWT, getCurrentUser);
router.get("/logout", verifyJWT, logout);


export default router;