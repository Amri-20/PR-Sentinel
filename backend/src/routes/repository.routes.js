import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  selectRepository,
  getSelectedRepositoryController,
  deleteSelectedRepository,
} from "../controllers/repository.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/selected", getSelectedRepositoryController);
router.post("/select", selectRepository);
router.delete("/:id", deleteSelectedRepository);

export default router;
