import { test } from "node:test";
import assert from "node:assert/strict";

import { detectStack } from "../src/utils/detectStack.js";
import { getWorkflowRules } from "../src/utils/workflowRules.js";
import { cleanAiOutput } from "../src/utils/cleanAiOutput.js";

// ---------- detectStack ----------

test("detectStack returns unknown when package.json is missing", () => {
  const stack = detectStack(null);
  assert.equal(stack.type, "unknown");
  assert.equal(stack.startCommand, null);
});

test("detectStack detects Next.js", () => {
  const stack = detectStack({ dependencies: { next: "14.0.0", react: "18.0.0" } });
  assert.equal(stack.framework, "Next.js");
  assert.equal(stack.type, "fullstack");
  assert.equal(stack.buildOutput, ".next");
  assert.equal(stack.startCommand, "npm start");
});

test("detectStack detects React with Vite", () => {
  const stack = detectStack({
    dependencies: { react: "18.0.0" },
    devDependencies: { vite: "5.0.0" },
  });
  assert.equal(stack.framework, "React (Vite)");
  assert.equal(stack.type, "frontend");
  assert.equal(stack.buildOutput, "dist");
  assert.equal(stack.startCommand, null);
});

test("detectStack detects Vue with Vite", () => {
  const stack = detectStack({
    dependencies: { vue: "3.0.0" },
    devDependencies: { vite: "5.0.0" },
  });
  assert.equal(stack.framework, "Vue (Vite)");
});

test("detectStack detects Create React App", () => {
  const stack = detectStack({ dependencies: { "react-scripts": "5.0.0" } });
  assert.equal(stack.framework, "React (CRA)");
  assert.equal(stack.buildOutput, "build");
});

test("detectStack uses scripts.start for Express", () => {
  const stack = detectStack({
    dependencies: { express: "5.0.0" },
    scripts: { start: "node src/index.js" },
  });
  assert.equal(stack.framework, "Express");
  assert.equal(stack.type, "backend");
  assert.equal(stack.startCommand, "npm start");
});

test("detectStack falls back to main when there is no start script", () => {
  const stack = detectStack({
    dependencies: { express: "5.0.0" },
    main: "src/index.js",
  });
  assert.equal(stack.startCommand, "node src/index.js");
});

test("detectStack returns null startCommand when neither start nor main exists", () => {
  const stack = detectStack({ dependencies: { express: "5.0.0" } });
  assert.equal(stack.startCommand, null);
});

test("detectStack falls back to generic Node.js backend", () => {
  const stack = detectStack({ dependencies: { lodash: "4.0.0" } });
  assert.equal(stack.framework, "Node.js");
  assert.equal(stack.type, "backend");
});

// ---------- getWorkflowRules ----------

test("getWorkflowRules requires the build step for frontend apps", () => {
  const rules = getWorkflowRules({
    repoName: "my-app",
    type: "frontend",
    framework: "React (Vite)",
  });
  assert.ok(rules.includes('required: run "npm run build"'));
  assert.ok(!rules.includes("npm run build --if-present"));
});

test("getWorkflowRules makes the build step optional for backend apps", () => {
  const rules = getWorkflowRules({
    repoName: "my-api",
    type: "backend",
    framework: "Express",
  });
  assert.ok(rules.includes("npm run build --if-present"));
});

test("getWorkflowRules lowercases the Docker image name", () => {
  const rules = getWorkflowRules({
    repoName: "Solace",
    type: "backend",
    framework: "Express",
  });
  assert.ok(rules.includes("/solace:latest"));
  assert.ok(!rules.includes("/Solace:"));
});

test("getWorkflowRules replaces invalid characters in the image name", () => {
  const rules = getWorkflowRules({
    repoName: "My App!",
    type: "backend",
    framework: "Express",
  });
  assert.ok(rules.includes("/my-app-:latest"));
});

// ---------- cleanAiOutput ----------

test("cleanAiOutput strips markdown fences", () => {
  const raw = "```yaml\nname: CI/CD\non: push\n```";
  assert.equal(cleanAiOutput(raw), "name: CI/CD\non: push");
});

test("cleanAiOutput drops chatter around a fenced block", () => {
  const raw = "Here you go:\n```dockerfile\nFROM node:20-alpine\n```\nHope it helps!";
  assert.equal(cleanAiOutput(raw), "FROM node:20-alpine");
});

test("cleanAiOutput leaves clean output untouched apart from trim", () => {
  assert.equal(cleanAiOutput("  FROM node:20-alpine\n"), "FROM node:20-alpine");
});

test("cleanAiOutput handles empty values", () => {
  assert.equal(cleanAiOutput(null), null);
  assert.equal(cleanAiOutput(undefined), undefined);
});
