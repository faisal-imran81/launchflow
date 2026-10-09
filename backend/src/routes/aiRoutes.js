import express from "express";
import {
  handleGenerateDockerfile,
  handleGenerateGithubActions,
  handleAutoDockerfile,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/dockerfile", handleGenerateDockerfile);
router.post("/dockerfile/auto", handleAutoDockerfile);
router.post("/github-actions", handleGenerateGithubActions);

export default router;
