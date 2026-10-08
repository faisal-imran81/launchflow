import express from "express";
import {
  handleGenerateDockerfile,
  handleGenerateGithubActions,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/dockerfile", handleGenerateDockerfile);
router.post("/github-actions", handleGenerateGithubActions);

export default router;
