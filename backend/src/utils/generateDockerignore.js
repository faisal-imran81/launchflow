const COMMON_RULES = [
  "# Dependencies",
  "node_modules",
  "",
  "# Version control",
  ".git",
  ".gitignore",
  "",
  "# Secrets (never bake these into an image)",
  ".env",
  ".env.*",
  "",
  "# Logs",
  "*.log",
  "npm-debug.log*",
  "",
  "# OS and editor files",
  ".DS_Store",
  ".vscode",
  ".idea",
  "",
  "# Docker files",
  "Dockerfile",
  ".dockerignore",
  "docker-compose*.yml",
];

const BUILD_OUTPUT_RULES = {
  frontend: ["# Build output (rebuilt inside the image)", "dist", "build"],
  fullstack: ["# Build output (rebuilt inside the image)", ".next", "out"],
  backend: [],
};

export function generateDockerignore(type = "backend") {
  const buildRules = BUILD_OUTPUT_RULES[type] || [];
  const lines = [...COMMON_RULES];

  if (buildRules.length > 0) {
    lines.push("", ...buildRules);
  }

  return lines.join("\n") + "\n";
}
