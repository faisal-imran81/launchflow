export function getWorkflowRules(analysis) {
  const { repoName, type, framework } = analysis;
  const imageName = repoName.toLowerCase().replace(/[^a-z0-9._-]/g, "-");

  const commonRules = [
    "- Workflow name: CI/CD",
    "- Trigger on push to the main branch only",
    "- Use a single job named build-and-push running on ubuntu-latest",
    "- Use actions/checkout@v4 and actions/setup-node@v4",
    "- Use Node.js version 20 with npm cache enabled",
    '- Install dependencies with "npm ci"',
  ];

  let buildRules;
  if (type === "frontend") {
    buildRules = [
      `- This is a ${framework} frontend app, so the build step is required: run "npm run build"`,
      '- Run tests with "npm test --if-present" so the workflow does not fail when no tests exist',
    ];
  } else if (type === "fullstack") {
    buildRules = [
      `- This is a ${framework} app, so the build step is required: run "npm run build"`,
      '- Run tests with "npm test --if-present" so the workflow does not fail when no tests exist',
    ];
  } else {
    buildRules = [
      '- This is a backend app, so run the build with "npm run build --if-present" (many backends have no build script)',
      '- Run tests with "npm test --if-present" so the workflow does not fail when no tests exist',
    ];
  }

  const dockerRules = [
    "- After build and test, log in to Docker Hub with docker/login-action@v3",
    "- Then build and push the image with docker/build-push-action@v5 (context: ., push: true)",
    "- Use GitHub Secrets DOCKER_USERNAME and DOCKER_PASSWORD for credentials, never hardcode them",
    `- Tag the image as \${{ secrets.DOCKER_USERNAME }}/${imageName}:latest and \${{ secrets.DOCKER_USERNAME }}/${imageName}:\${{ github.sha }}`,
  ];

  return [...commonRules, ...buildRules, ...dockerRules].join("\n");
}
