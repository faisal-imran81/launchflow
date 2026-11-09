import { useState } from "react";
import {
  generateDockerfile,
  generateGithubActions,
  generateAutoDockerfile,
  generateAutoGithubActions,
  generateNginxConfig,
} from "../services/aiService.js";
import { resolveAiError } from "../utils/aiErrorMessages.js";

const AI_TIMEOUT_MS = 30000; // 30 seconds

export function useAI() {
  const [dockerfile, setDockerfile] = useState(null);
  const [githubActionsYaml, setGithubActionsYaml] = useState(null);
  const [autoResult, setAutoResult] = useState(null);
  const [autoWorkflow, setAutoWorkflow] = useState(null);
  const [nginxConfig, setNginxConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  async function handleGenerateDockerfile(repoInfo) {
    setLoading(true);
    setError(null);
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI request timed out. Please try again.')), AI_TIMEOUT_MS)
      );
      const data = await Promise.race([
        generateDockerfile(repoInfo),
        timeoutPromise,
      ]);
      setDockerfile(data.dockerfile);
      return true;
    } catch (err) {
      if (err.message?.includes('timed out')) {
        setDockerfile(null);
        setError('AI request timed out after 30 seconds. Please try again.');
        return false;
      }

      if (!navigator.onLine) {
        setDockerfile(null);
        setError('No internet connection. AI generation requires an active connection.');
        return false;
      }

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
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI request timed out. Please try again.')), AI_TIMEOUT_MS)
      );
      const data = await Promise.race([
        generateGithubActions(repoInfo),
        timeoutPromise,
      ]);
      setGithubActionsYaml(data.yaml);
      return true;
    } catch (err) {
      if (err.message?.includes('timed out')) {
        setGithubActionsYaml(null);
        setError('AI request timed out after 30 seconds. Please try again.');
        return false;
      }

      if (!navigator.onLine) {
        setGithubActionsYaml(null);
        setError('No internet connection. AI generation requires an active connection.');
        return false;
      }

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
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI request timed out. Please try again.')), AI_TIMEOUT_MS)
      );
      const data = await Promise.race([
        generateAutoDockerfile({ owner, repo }),
        timeoutPromise,
      ]);
      setAutoResult({
        detected: data.detected,
        dockerfile: data.dockerfile,
        dockerignore: data.dockerignore,
      });
      return true;
    } catch (err) {
      if (err.message?.includes('timed out')) {
        setAutoResult(null);
        setError('AI request timed out after 30 seconds. Please try again.');
        return false;
      }

      if (!navigator.onLine) {
        setAutoResult(null);
        setError('No internet connection. AI generation requires an active connection.');
        return false;
      }

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
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI request timed out. Please try again.')), AI_TIMEOUT_MS)
      );
      const data = await Promise.race([
        generateAutoGithubActions({ owner, repo }),
        timeoutPromise,
      ]);
      setAutoWorkflow({
        detected: data.detected,
        yaml: data.yaml,
      });
      return true;
    } catch (err) {
      if (err.message?.includes('timed out')) {
        setAutoWorkflow(null);
        setError('AI request timed out after 30 seconds. Please try again.');
        return false;
      }

      if (!navigator.onLine) {
        setAutoWorkflow(null);
        setError('No internet connection. AI generation requires an active connection.');
        return false;
      }

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
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI request timed out. Please try again.')), AI_TIMEOUT_MS)
      );
      const [dockerData, workflowData] = await Promise.race([
        Promise.all([
          generateAutoDockerfile({ owner, repo }),
          generateAutoGithubActions({ owner, repo }),
        ]),
        timeoutPromise,
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
      if (err.message?.includes('timed out')) {
        setAutoResult(null);
        setAutoWorkflow(null);
        setError('AI request timed out after 30 seconds. Please try again.');
        return false;
      }

      if (!navigator.onLine) {
        setAutoResult(null);
        setAutoWorkflow(null);
        setError('No internet connection. AI generation requires an active connection.');
        return false;
      }

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
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI request timed out. Please try again.')), AI_TIMEOUT_MS)
      );
      const data = await Promise.race([
        generateNginxConfig(repoInfo),
        timeoutPromise,
      ]);
      setNginxConfig(data.config);
      return true;
    } catch (err) {
      if (err.message?.includes('timed out')) {
        setNginxConfig(null);
        setError('AI request timed out after 30 seconds. Please try again.');
        return false;
      }

      if (!navigator.onLine) {
        setNginxConfig(null);
        setError('No internet connection. AI generation requires an active connection.');
        return false;
      }

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

  const retry = (fn) => {
    if (retryCount >= 3) {
      setError('Maximum retries reached. Please refresh the page.');
      return;
    }
    setRetryCount(prev => prev + 1);
    setError(null);
    fn?.();
  };

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
    retry,
    retryCount,
  };
}
