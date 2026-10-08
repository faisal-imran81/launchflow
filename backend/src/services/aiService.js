import groq from "../config/groq.js";

const AI_MODEL = "openai/gpt-oss-20b";

export async function generateDockerfile(repoInfo) {
  const { repoName, language, framework, description } = repoInfo;

  const prompt = `You are a DevOps expert. Generate a production-ready Dockerfile for the following project:

Repository: ${repoName}
Language: ${language || "Not specified"}
Framework: ${framework || "Not specified"}
Description: ${description || "No description provided"}

Requirements:
- Use appropriate base image
- Include all necessary build steps
- Optimize for production (multi-stage build if needed)
- Expose correct port
- Set proper CMD/ENTRYPOINT

Return ONLY the Dockerfile content, no explanation, no markdown code blocks.`;

  const completion = await groq.chat.completions.create({
    model: AI_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content?.trim();
}

export async function generateGithubActionsYAML(repoInfo) {
  const { repoName, language, framework } = repoInfo;

  const prompt = `You are a DevOps expert. Generate a GitHub Actions CI/CD YAML workflow for the following project:

Repository: ${repoName}
Language: ${language || "Not specified"}
Framework: ${framework || "Not specified"}

Requirements:
- Trigger on push to main branch
- Include build and test steps
- Add Docker build and push to Docker Hub
- Use GitHub Secrets for credentials (DOCKER_USERNAME, DOCKER_PASSWORD)

Return ONLY the YAML content, no explanation, no markdown code blocks.`;

  const completion = await groq.chat.completions.create({
    model: AI_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content?.trim();
}
