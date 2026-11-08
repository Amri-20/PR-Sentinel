import { Router } from "express";

const router = Router();

// Temporary test route
router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "User routes working!",
  });
});

export default router;
