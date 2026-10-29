import express from "express";
import {
  handleGenerateDockerfile,
  handleGenerateGithubActions,
  handleAutoDockerfile,
  handleAutoGithubActions,
  handleGenerateNginxConfig,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/dockerfile", handleGenerateDockerfile);
router.post("/dockerfile/auto", handleAutoDockerfile);
router.post("/github-actions", handleGenerateGithubActions);
router.post("/github-actions/auto", handleAutoGithubActions);
router.post('/nginx', handleGenerateNginxConfig)

export default router;
