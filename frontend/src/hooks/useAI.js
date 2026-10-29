import { useState } from "react";
import {
  generateDockerfile,
  generateGithubActions,
  generateAutoDockerfile,
  generateAutoGithubActions,
  generateNginxConfig,
} from "../services/aiService.js";
import { resolveAiError } from "../utils/aiErrorMessages.js";

export function useAI() {
  const [dockerfile, setDockerfile] = useState(null);
  const [githubActionsYaml, setGithubActionsYaml] = useState(null);
  const [autoResult, setAutoResult] = useState(null);
  const [autoWorkflow, setAutoWorkflow] = useState(null);
  const [nginxConfig, setNginxConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerateDockerfile(repoInfo) {
    setLoading(true);
    setError(null);
    try {
      const data = await generateDockerfile(repoInfo);
      setDockerfile(data.dockerfile);
      return true;
    } catch (err) {
      setDockerfile(null);
      setError(resolveAiError(err, "Failed to generate Dockerfile"));
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateGithubActions(repoInfo) {
    setLoading(true);
    setError(null);
    try {
      const data = await generateGithubActions(repoInfo);
      setGithubActionsYaml(data.yaml);
      return true;
    } catch (err) {
      setGithubActionsYaml(null);
      setError(resolveAiError(err, "Failed to generate GitHub Actions YAML"));
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAutoDockerfile({ owner, repo }) {
    setLoading(true);
    setError(null);
    try {
      const data = await generateAutoDockerfile({ owner, repo });
      setAutoResult({
        detected: data.detected,
        dockerfile: data.dockerfile,
        dockerignore: data.dockerignore,
      });
      return true;
    } catch (err) {
      setAutoResult(null);
      setError(resolveAiError(err, "Failed to analyze repository"));
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAutoGithubActions({ owner, repo }) {
    setLoading(true);
    setError(null);
    try {
      const data = await generateAutoGithubActions({ owner, repo });
      setAutoWorkflow({
        detected: data.detected,
        yaml: data.yaml,
      });
      return true;
    } catch (err) {
      setAutoWorkflow(null);
      setError(resolveAiError(err, "Failed to generate workflow for repository"));
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAutoAll({ owner, repo }) {
    setLoading(true);
    setError(null);
    try {
      const [dockerData, workflowData] = await Promise.all([
        generateAutoDockerfile({ owner, repo }),
        generateAutoGithubActions({ owner, repo }),
      ]);
      setAutoResult({
        detected: dockerData.detected,
        dockerfile: dockerData.dockerfile,
        dockerignore: dockerData.dockerignore,
      });
      setAutoWorkflow({
        detected: workflowData.detected,
        yaml: workflowData.yaml,
      });
      return true;
    } catch (err) {
      setAutoResult(null);
      setAutoWorkflow(null);
      setError(resolveAiError(err, "Failed to analyze repository"));
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateNginxConfig(repoInfo) {
    setLoading(true);
    setError(null);
    try {
      const data = await generateNginxConfig(repoInfo);
      setNginxConfig(data.config);
      return true;
    } catch (err) {
      setNginxConfig(null);
      setError(resolveAiError(err, "Failed to generate Nginx config"));
      return false;
    } finally {
      setLoading(false);
    }
  }

  function clearError() {
    setError(null);
  }

  function reset() {
    setDockerfile(null);
    setGithubActionsYaml(null);
    setAutoResult(null);
    setAutoWorkflow(null);
    setNginxConfig(null);
    setError(null);
    setLoading(false);
  }

  return {
    dockerfile,
    githubActionsYaml,
    autoResult,
    autoWorkflow,
    nginxConfig,
    loading,
    error,
    generateDockerfile: handleGenerateDockerfile,
    generateGithubActions: handleGenerateGithubActions,
    generateAutoDockerfile: handleGenerateAutoDockerfile,
    generateAutoGithubActions: handleGenerateAutoGithubActions,
    generateAutoAll: handleGenerateAutoAll,
    generateNginxConfig: handleGenerateNginxConfig,
    clearError,
    reset,
  };
}
