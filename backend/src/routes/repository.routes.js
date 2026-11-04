import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  selectRepository,
  getSelectedRepositoriesController,
  deleteSelectedRepository,
} from "../controllers/repositories.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/selected", getSelectedRepositoriesController);
router.get("/select", selectRepository);
router.get("/:id", deleteSelectedRepository);

export default router;
