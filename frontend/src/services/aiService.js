import api from "./api.js";

export async function generateDockerfile(repoInfo) {
  const response = await api.post("/ai/dockerfile", repoInfo);
  return response.data;
}

export async function generateGithubActions(repoInfo) {
  const response = await api.post("/ai/github-actions", repoInfo);
  return response.data;
}
