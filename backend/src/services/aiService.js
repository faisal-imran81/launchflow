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
- Use appropriate base image (node:20-alpine for Node.js projects)
- Use multi-stage build for frontend apps
- In the build stage, install ALL dependencies with "npm ci" (never use --only=production or --omit=dev there, because build tools like Vite need devDependencies)
- If the framework is Vite or React with Vite, the build output folder is "dist" (not "build")
- If the framework is Create React App, the build output folder is "build"
- For frontend apps, serve the built files with nginx:stable-alpine
- For backend apps, use "npm ci --omit=dev" in the final stage
- Expose the correct port
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
- Use actions/checkout@v4 and actions/setup-node@v4
- Use Node.js version 20 with npm cache enabled
- Use "npm ci" to install dependencies
- Run "npm run build" for the build step
- Run tests with "npm test --if-present" so the workflow does not fail when no tests exist
- Add Docker build and push to Docker Hub using docker/login-action@v3 and docker/build-push-action@v5
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
