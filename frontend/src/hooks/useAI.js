import { useState } from "react";
import {
  generateDockerfile,
  generateGithubActions,
  generateAutoDockerfile,
  generateAutoGithubActions,
} from "../services/aiService.js";

export function useAI() {
  const [dockerfile, setDockerfile] = useState(null);
  const [githubActionsYaml, setGithubActionsYaml] = useState(null);
  const [autoResult, setAutoResult] = useState(null);
  const [autoWorkflow, setAutoWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerateDockerfile(repoInfo) {
    setLoading(true);
    setError(null);
    setDockerfile(null);
    try {
      const data = await generateDockerfile(repoInfo);
      setDockerfile(data.dockerfile);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate Dockerfile");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateGithubActions(repoInfo) {
    setLoading(true);
    setError(null);
    setGithubActionsYaml(null);
    try {
      const data = await generateGithubActions(repoInfo);
      setGithubActionsYaml(data.yaml);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate GitHub Actions YAML");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAutoDockerfile({ owner, repo }) {
    setLoading(true);
    setError(null);
    setAutoResult(null);
    try {
      const data = await generateAutoDockerfile({ owner, repo });
      setAutoResult({
        detected: data.detected,
        dockerfile: data.dockerfile,
        dockerignore: data.dockerignore,
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to analyze repository");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAutoGithubActions({ owner, repo }) {
    setLoading(true);
    setError(null);
    setAutoWorkflow(null);
    try {
      const data = await generateAutoGithubActions({ owner, repo });
      setAutoWorkflow({
        detected: data.detected,
        yaml: data.yaml,
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate workflow for repository");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAutoAll({ owner, repo }) {
    setLoading(true);
    setError(null);
    setAutoResult(null);
    setAutoWorkflow(null);
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
    } catch (err) {
      setError(err.response?.data?.error || "Failed to analyze repository");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setDockerfile(null);
    setGithubActionsYaml(null);
    setAutoResult(null);
    setAutoWorkflow(null);
    setError(null);
    setLoading(false);
  }

  return {
    dockerfile,
    githubActionsYaml,
    autoResult,
    autoWorkflow,
    loading,
    error,
    generateDockerfile: handleGenerateDockerfile,
    generateGithubActions: handleGenerateGithubActions,
    generateAutoDockerfile: handleGenerateAutoDockerfile,
    generateAutoGithubActions: handleGenerateAutoGithubActions,
    generateAutoAll: handleGenerateAutoAll,
    reset,
  };
}
