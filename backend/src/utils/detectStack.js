function getStartCommand(packageJson) {
  if (packageJson.scripts?.start) return "npm start";
  if (packageJson.main) return `node ${packageJson.main}`;
  return null;
}

export function detectStack(packageJson) {
  if (!packageJson) {
    return {
      language: "Unknown",
      framework: "Unknown",
      type: "unknown",
      buildOutput: null,
      port: null,
      startCommand: null,
    };
  }

  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const has = (name) => Boolean(deps[name]);
  const startCommand = getStartCommand(packageJson);

  if (has("next")) {
    return {
      language: "JavaScript",
      framework: "Next.js",
      type: "fullstack",
      buildOutput: ".next",
      port: 3000,
      startCommand: "npm start",
    };
  }

  if (has("vite")) {
    const framework = has("react") ? "React (Vite)" : has("vue") ? "Vue (Vite)" : "Vite";
    return {
      language: "JavaScript",
      framework,
      type: "frontend",
      buildOutput: "dist",
      port: 80,
      startCommand: null,
    };
  }

  if (has("react-scripts")) {
    return {
      language: "JavaScript",
      framework: "React (CRA)",
      type: "frontend",
      buildOutput: "build",
      port: 80,
      startCommand: null,
    };
  }

  if (has("express") || has("fastify") || has("koa") || has("@nestjs/core")) {
    const framework = has("express") ? "Express" : has("fastify") ? "Fastify" : has("koa") ? "Koa" : "NestJS";
    return {
      language: "JavaScript",
      framework,
      type: "backend",
      buildOutput: null,
      port: 3000,
      startCommand,
    };
  }

  return {
    language: "JavaScript",
    framework: "Node.js",
    type: "backend",
    buildOutput: null,
    port: 3000,
    startCommand,
  };
}
