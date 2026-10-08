import { useState } from "react";
import { generateDockerfile, generateGithubActions } from "../services/aiService.js";

export function useAI() {
  const [dockerfile, setDockerfile] = useState(null);
  const [githubActionsYaml, setGithubActionsYaml] = useState(null);
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

  function reset() {
    setDockerfile(null);
    setGithubActionsYaml(null);
    setError(null);
    setLoading(false);
  }

  return {
    dockerfile,
    githubActionsYaml,
    loading,
    error,
    generateDockerfile: handleGenerateDockerfile,
    generateGithubActions: handleGenerateGithubActions,
    reset,
  };
}
