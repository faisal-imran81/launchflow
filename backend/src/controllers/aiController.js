import {
  generateDockerfile,
  generateGithubActionsYAML,
  generateDockerfileFromStack,
  generateGithubActionsFromStack,
  generateNginxConfig,
} from "../services/aiService.js";
import { analyzeRepo } from "../services/repoAnalysisService.js";
import { generateDockerignore } from "../utils/generateDockerignore.js";

/**
 * @async
 * @function handleGenerateDockerfile
 * @description Accepts a GitHub repository URL and file tree, sends them to the Groq LLM,
 * and returns an AI-generated production-ready Dockerfile for the detected stack.
 *
 * @route POST /api/ai/dockerfile
 *
 * @param {import('express').Request} req - Express request object
 * @param {object} req.body - Request body
 * @param {string} req.body.repoUrl - GitHub repository URL (e.g. https://github.com/owner/repo)
 * @param {string} req.body.repoFiles - Stringified file tree of the repository
 * @param {string} [req.body.stack] - Optional manually specified stack override
 *
 * @param {import('express').Response} res - Express response object
 *
 * @returns {Promise<void>} JSON response containing the generated Dockerfile string
 *
 * @example
 * // POST /api/ai/dockerfile
 * // Body: { repoUrl: "https://github.com/owner/repo", repoFiles: "...", stack: "nodejs" }
 * // Response: { dockerfile: "FROM node:20-alpine\n..." }
 */
export async function handleGenerateDockerfile(req, res, next) {
  try {
    const { repoName: providedRepoName, repoUrl, language, framework, description } = req.body;
    const repoName = providedRepoName
      ?? repoUrl?.split('/').filter(Boolean).pop()
      ?? null;

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

/**
 * @async
 * @function handleGenerateGithubActions
 * @description Accepts a GitHub repository URL, Dockerfile content, and stack information,
 * sends them to the Groq LLM, and returns an AI-generated GitHub Actions CI/CD workflow YAML
 * configured for Docker build and push to AWS ECR.
 *
 * @route POST /api/ai/github-actions
 *
 * @param {import('express').Request} req - Express request object
 * @param {object} req.body - Request body
 * @param {string} req.body.repoUrl - GitHub repository URL
 * @param {string} req.body.dockerfile - Previously generated Dockerfile content
 * @param {string} [req.body.stack] - Detected or manually specified stack
 *
 * @param {import('express').Response} res - Express response object
 *
 * @returns {Promise<void>} JSON response containing the generated GitHub Actions workflow YAML string
 *
 * @example
 * // POST /api/ai/github-actions
 * // Body: { repoUrl: "https://github.com/owner/repo", dockerfile: "FROM node:20...", stack: "nodejs" }
 * // Response: { workflow: "name: CI/CD\non: push:\n..." }
 */
export async function handleGenerateGithubActions(req, res, next) {
  try {
    const { repoName: providedRepoName, repoUrl, language, framework } = req.body;
    const repoName = providedRepoName
      ?? repoUrl?.split('/').filter(Boolean).pop()
      ?? null;

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

/**
 * POST /api/ai/nginx
 * Body: { repoName: string, domain: string, port: number, framework?: string, type?: string }
 */
export async function handleGenerateNginxConfig(req, res, next) {
  const { repoName, domain, port, framework, type } = req.body ?? {}

  if (!repoName || typeof repoName !== 'string') {
    return res.status(400).json({ error: 'repoName is required and must be a string' })
  }

  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: 'domain is required and must be a string' })
  }

  if (!port) {
    return res.status(400).json({ error: 'port is required' })
  }

  try {
    const config = await generateNginxConfig({ repoName, domain, port, framework, type })
    return res.status(200).json({ ok: true, config })
  } catch (err) {
    return next(err)
  }
}
