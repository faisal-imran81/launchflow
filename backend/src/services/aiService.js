import groq from "../config/groq.js";
import { getWorkflowRules } from "../utils/workflowRules.js";

const AI_MODEL = "openai/gpt-oss-20b";

function handleGroqError(error) {
  if (error.status === 429) {
    const err = new Error("AI rate limit reached. Please try again in a minute.");
    err.status = 429;
    throw err;
  }
  if (error.status === 401) {
    const err = new Error("AI service authentication failed. Check GROQ_API_KEY.");
    err.status = 500;
    throw err;
  }
  const err = new Error("AI generation failed. Please try again.");
  err.status = 502;
  throw err;
}

async function runCompletion(prompt) {
  try {
    const completion = await groq.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 4096,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      const err = new Error("AI returned an empty response. Please try again.");
      err.status = 502;
      throw err;
    }
    return content;
  } catch (error) {
    if (error.status && error.message.startsWith("AI")) throw error;
    handleGroqError(error);
  }
}

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

  return runCompletion(prompt);
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

  return runCompletion(prompt);
}

export async function generateDockerfileFromStack(analysis) {
  const { repoName, description, framework, type, buildOutput, port, startCommand } = analysis;

  let stackRules;
  if (type === "frontend") {
    stackRules = `- This is a frontend app. Use a multi-stage build.
- Build stage: node:20-alpine, install ALL dependencies with "npm ci" (never --only=production or --omit=dev here), then run "npm run build".
- The build output folder is "${buildOutput}".
- Final stage: nginx:stable-alpine, copy /app/${buildOutput} to /usr/share/nginx/html.
- Expose port ${port} and run nginx with "daemon off;".`;
  } else if (type === "fullstack") {
    stackRules = `- This is a Next.js app. Use a multi-stage build with node:20-alpine.
- Build stage: run "npm ci", then "npm run build", then "mkdir -p public" (so the public folder always exists), then "npm prune --omit=dev" (so node_modules only keeps production dependencies).
- Final stage: set NODE_ENV=production, and copy these from the build stage: "/app/package.json" together with "/app/next.config.*" in ONE single COPY instruction (the wildcard is safe because package.json always matches), plus node_modules, the .next folder, and the public folder.
- Do NOT copy any .env files into the image, secrets must be passed at runtime.
- Start with "npm start".
- Expose port ${port}.`;
  } else {
    const startRule = startCommand
      ? `- Start the app with the exact command "${startCommand}", written in exec form as the CMD (for example CMD ["npm", "start"] or CMD ["node", "src/index.js"]).`
      : `- No start command could be detected from package.json. Use CMD ["npm", "start"] and add this comment line right above it: "# TODO: no start script found in package.json, set the correct start command".`;

    stackRules = `- This is a backend Node.js app. Use node:20-alpine.
- Copy package*.json first, then run "npm ci --omit=dev" for production dependencies.
- Copy the rest of the source code.
- Expose port ${port || 3000}.
${startRule}`;
  }

  const prompt = `You are a DevOps expert. Generate a production-ready Dockerfile for the following project:

Repository: ${repoName}
Framework: ${framework}
Description: ${description || "No description provided"}

Requirements:
${stackRules}

Return ONLY the Dockerfile content, no explanation, no markdown code blocks.`;

  const completion = await groq.chat.completions.create({
    model: AI_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
  });

  return completion.choices[0]?.message?.content?.trim();
}

export async function generateGithubActionsFromStack(analysis) {
  const { repoName, framework } = analysis;
  const rules = getWorkflowRules(analysis);

  const prompt = `You are a DevOps expert. Generate a GitHub Actions CI/CD workflow YAML for the following project:

Repository: ${repoName}
Framework: ${framework}

Requirements:
${rules}

Return ONLY the YAML content, no explanation, no markdown code blocks.`;

  const completion = await groq.chat.completions.create({
    model: AI_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
  });

  return completion.choices[0]?.message?.content?.trim();
}
