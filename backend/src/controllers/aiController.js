import {
  generateDockerfile,
  generateGithubActionsYAML,
  generateDockerfileFromStack,
  generateGithubActionsFromStack,
} from "../services/aiService.js";
import { analyzeRepo } from "../services/repoAnalysisService.js";
import { generateDockerignore } from "../utils/generateDockerignore.js";

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

export async function handleAutoDockerfile(req, res, next) {
  try {
    const { owner, repo } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({ error: "owner and repo are required" });
    }

    const analysis = await analyzeRepo(owner, repo);

    if (!analysis.hasPackageJson) {
      return res.status(422).json({
        error: "No package.json found in this repository. Only Node.js projects are supported for now.",
      });
    }

    const dockerfile = await generateDockerfileFromStack(analysis);
    const dockerignore = generateDockerignore(analysis.type);

    res.json({
      success: true,
      detected: {
        framework: analysis.framework,
        type: analysis.type,
        buildOutput: analysis.buildOutput,
        port: analysis.port,
        startCommand: analysis.startCommand,
      },
      dockerfile,
      dockerignore,
    });
  } catch (error) {
    next(error);
  }
}

export async function handleAutoGithubActions(req, res, next) {
  try {
    const { owner, repo } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({ error: "owner and repo are required" });
    }

    const analysis = await analyzeRepo(owner, repo);

    if (!analysis.hasPackageJson) {
      return res.status(422).json({
        error: "No package.json found in this repository. Only Node.js projects are supported for now.",
      });
    }

    const yaml = await generateGithubActionsFromStack(analysis);

    res.json({
      success: true,
      detected: {
        framework: analysis.framework,
        type: analysis.type,
        buildOutput: analysis.buildOutput,
        port: analysis.port,
        startCommand: analysis.startCommand,
      },
      yaml,
    });
  } catch (error) {
    next(error);
  }
}
