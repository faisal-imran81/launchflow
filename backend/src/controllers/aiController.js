import { generateDockerfile, generateGithubActionsYAML } from "../services/aiService.js";

export async function handleGenerateDockerfile(req, res, next) {
  try {
    const { repoName, language, framework, description } = req.body;

    if (!repoName) {
      return res.status(400).json({ error: "repoName is required" });
    }

    const dockerfile = await generateDockerfile({
      repoName,
      language,
      framework,
      description,
    });

    res.json({ success: true, dockerfile });
  } catch (error) {
    next(error);
  }
}

export async function handleGenerateGithubActions(req, res, next) {
  try {
    const { repoName, language, framework } = req.body;

    if (!repoName) {
      return res.status(400).json({ error: "repoName is required" });
    }

    const yaml = await generateGithubActionsYAML({
      repoName,
      language,
      framework,
    });

    res.json({ success: true, yaml });
  } catch (error) {
    next(error);
  }
}
