export function detectStack(packageJson) {
  if (!packageJson) {
    return { language: "Unknown", framework: "Unknown", type: "unknown", buildOutput: null, port: null };
  }

  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const has = (name) => Boolean(deps[name]);

  if (has("next")) {
    return { language: "JavaScript", framework: "Next.js", type: "fullstack", buildOutput: ".next", port: 3000 };
  }

  if (has("vite")) {
    const framework = has("react") ? "React (Vite)" : has("vue") ? "Vue (Vite)" : "Vite";
    return { language: "JavaScript", framework, type: "frontend", buildOutput: "dist", port: 80 };
  }

  if (has("react-scripts")) {
    return { language: "JavaScript", framework: "React (CRA)", type: "frontend", buildOutput: "build", port: 80 };
  }

  if (has("express") || has("fastify") || has("koa") || has("@nestjs/core")) {
    const framework = has("express") ? "Express" : has("fastify") ? "Fastify" : has("koa") ? "Koa" : "NestJS";
    return { language: "JavaScript", framework, type: "backend", buildOutput: null, port: 3000 };
  }

  return { language: "JavaScript", framework: "Node.js", type: "backend", buildOutput: null, port: 3000 };
}
