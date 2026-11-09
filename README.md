# 🚀 LaunchFlow

A full-stack deployment platform that lets you deploy your GitHub repositories with a single click — powered by React, Express, Supabase, and the GitHub API.

## Live Demo

> Coming soon — Week 4 launch

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- Supabase JS Client
- React Router DOM

### Backend
- Node.js + Express.js
- Supabase (PostgreSQL)
- GitHub REST API
- Dockerode (Docker daemon integration)
- AWS SDK v3 — EC2 (instance lifecycle management)
- AWS SDK v3 — ECR (container registry management)
- Nginx config generation + validation (stack-aware templates)

## Features

- 🔍 Search your GitHub repos directly from the deploy form
- 🚀 One-click deployment trigger
- 📋 Full deployment history with status tracking
- 🗑 Delete deployments from the UI
- 📊 Dashboard with live deployment stats
- ⚡ Real-time loading skeletons
- 🌐 404 page with redirect
- 🐳 Docker image build from generated Dockerfile
- 📦 Container run, stop and remove via REST API
- 📋 Container log fetching (stdout + stderr)
- ☁️ AWS EC2 instance launch, stop, start and terminate via REST API
- 🔍 List and describe LaunchFlow-managed EC2 instances
- 📦 AWS ECR repository create, list and delete via REST API
- 🚀 Docker image tag and push to ECR with auto auth token fetch
- 🗂 ECR image list and delete by tag or digest
- 🌐 Nginx reverse proxy config generation (basic, stack-aware, SSL)
- 🤖 AI-powered Nginx config generation via Groq
- ✅ Nginx config validation with error and warning reporting

## Project Structure

launchflow/
├── frontend/ # React + Vite app
├── backend/ # Express.js API
└── README.md


## Getting Started

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Roadmap

- [x] Week 1 — Frontend + Backend Foundation
- [x] Week 2 — AI Engine (Groq API)
- [ ] Week 3 — Docker + AWS
- [ ] Week 4 — Polish + Launch

## Current Status

- ✅ Week 1 — Frontend + Backend Foundation (Days 1–7)
- ✅ Week 2 — AI Engine (Days 8–14)
- ✅ Week 3 — Docker + AWS (Days 15–21)
- 🔄 Week 4 — Polish + Launch Ready (Days 22–28)
  - ✅ Day 22 — Full flow end-to-end testing (691 tests, 0 failures)
  - ✅ Day 23 — UI/UX polish (charcoal/green/crimson, Raycast glass theme)
  - ✅ Day 24 — Error states + loading states (crimson errors, offline detection, skeletons)
  - ⏳ Day 25 — README + documentation
  - ⏳ Day 26 — Demo video recording
  - ⏳ Day 27 — LinkedIn post ready
  - ⏳ Day 28 — 🚀 v1.0 Launch

## 🤖 AI Engine

LaunchFlow uses the Groq API to generate deployment files for a repository.

### What it generates

- **Dockerfile**: multi-stage for frontend apps, production-only dependencies for backends
- **.dockerignore**: fixed rules per stack, so secrets like `.env` never end up in an image
- **GitHub Actions workflow**: stack-aware CI/CD (build step depends on the detected stack, Docker image name is lowercased automatically) with Docker Hub push

### Auto-detect

Enter `owner/repo` on the Deploy page. The backend reads the repo's `package.json`, detects the stack (Next.js, Vite/React, CRA, Express and other Node.js backends), and builds the prompt from the detected build output folder, port and start command.

One click on **Auto-detect & Generate All** returns the Dockerfile, `.dockerignore` and GitHub Actions workflow together. Each output has Copy and Download buttons. The workflow downloads as `ci.yml`; place it at `.github/workflows/ci.yml` in your repo.

Currently only Node.js repositories with a `package.json` in the repo root are supported.

### Output panel

- Auto-detected results open in tabs (Dockerfile, .dockerignore, Workflow) with a line count badge on each panel
- Copy and Download buttons on every panel; files download as `Dockerfile`, `.dockerignore` and `ci.yml`
- Regenerate button re-runs the last auto-detect, and the previous results stay visible (dimmed) while the new ones load
- The last entered `owner/repo` is remembered in the browser (localStorage), so a page refresh does not clear the input
- An empty state hint shows before anything has been generated

### Mobile

The sidebar is hidden below 768px because the navbar carries the same links. The navbar, History header and AI Engine panels wrap on small screens.

### API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/dockerfile` | Dockerfile from manual input |
| POST | `/api/ai/dockerfile/auto` | Auto-detect stack from a GitHub repo, returns Dockerfile and .dockerignore |
| POST | `/api/ai/github-actions` | GitHub Actions workflow from manual input |
| POST | `/api/ai/github-actions/auto` | Auto-detect stack from a GitHub repo, returns a stack-aware workflow |

> The generated workflow expects a `Dockerfile` in the repo root and the secrets `DOCKER_USERNAME` and `DOCKER_PASSWORD` to be configured in your repository settings.

### Environment variables

```
GROQ_API_KEY=your_groq_api_key_here
GITHUB_TOKEN=your_github_token_here   # optional, raises GitHub rate limit
```

Never commit real keys. Only `.env.example` is tracked in git.

## 🐳 Week 3 — Docker + AWS (Coming Next)

Week 3 builds on the AI Engine to take generated Dockerfiles all the way to a running container on AWS.

| Day | Task |
|-----|------|
| Day 15 ✅ | Docker integration — build and run containers from the backend |
| Day 16 ✅ | AWS EC2 setup — provision and connect to a cloud instance |
| Day 17 ✅ | AWS ECR — push Docker images to a private registry |
| Day 18 ✅ | Nginx configuration — reverse proxy config generation + AI-powered generation |
| Day 19 ✅ | Real-time log streaming — SSE container logs, build logs, polling fallback, useLogStream hook, LogStreamPanel UI |
| Day 20 ✅ | Deployment status tracking — Supabase persistence, SSE stream, pipeline timeline UI, 34 new tests |
| Day 21 ✅ | Buffer + testing — 103 new tests, 6 bug fixes, error boundary, UI polish, 583 total |
| Day 22 ✅ | Full flow end-to-end testing — 691 tests / 208 suites, 0 failures |
| Day 23 ✅ | UI/UX polish — charcoal/forest-green/crimson theme, glass surfaces, Raycast-inspired design |
| Day 24 ✅ | Error states + loading states — crimson errors, green success, offline detection, skeleton variants |

> The AI Engine (Week 2) generates the Dockerfile and CI/CD workflow. Week 3 executes that workflow end-to-end on real cloud infrastructure.

## Author

**Faisal Imran**
- GitHub: [@faisal-imran81](https://github.com/faisal-imran81)
- LinkedIn: [faisal-imran-623284373](https://linkedin.com/in/faisal-imran-623284373)

## 🧪 Testing

Backend unit tests use Node's built-in test runner, so there are no extra dependencies.

```bash
cd backend
npm test
```

**450 tests, 0 failures** — no extra dependencies, no network calls.

| Test file | What it covers |
|---|---|
| `detectStack.test.js` | null input, all framework detections, startCommand logic |
| `detectStack.stacks.test.js` | full shape for all 12 fixture `package.json` files |
| `cleanAiOutput.test.js` | fenced block extraction, trimming, edge inputs |
| `cleanAiOutput.edge.test.js` | preamble/epilogue stripping, malformed fences, content preservation |
| `validateDockerfile.test.js` | 39 cases — valid files, FROM rules, unknown instructions, base image tags, CMD/EXPOSE warnings, hardcoded secrets |
| `validateWorkflow.test.js` | structure rules, action pinning, Docker login, hardcoded secrets |
| `promptRules.test.js` | per-stack CI rules, build step, image tag slug, credential safety |
| `workflowRules.test.js` | image name slugification, Docker Hub login and build-push steps, secret safety |
| `errorHandler.test.js` | 500 masking, AI error passthrough, err.code forwarding |
| other utils | `asyncHandler`, `parseOwnerRepo`, `rateLimit`, `sanitizeInput`, `validateJson`, `generateDockerignore`, `notFound`, `requestLogger`, `healthRoute` |

None of these call the Groq API. For AI output evaluation see `backend/scripts/evalAi.js`.

## Testing AI Outputs

Day 13 of the roadmap focused on validating every AI-generated file before it reaches the client.

### What is tested

| Layer | File | What it checks |
|---|---|---|
| Unit | `backend/tests/validateDockerfile.test.js` | 39 cases — valid Dockerfiles, FROM rules, unknown instructions, base image tags, CMD/EXPOSE warnings, hardcoded secrets |
| Unit | `backend/tests/validateWorkflow.test.js` | structure rules, action pinning, docker login, hardcoded secrets |
| Unit | `backend/tests/cleanAiOutput.edge.test.js` | preamble/epilogue stripping, malformed fences, content preservation |
| Unit | `backend/tests/promptRules.test.js` | per-stack CI rules, build step, image tag, credential safety |
| Fixtures | `backend/tests/fixtures/stacks/` | 12 sample `package.json` files (Vite, Vue, CRA, Next.js, Express, Fastify, Koa, NestJS, plain Node) |
| Integration | `backend/tests/detectStack.stacks.test.js` | full `detectStack` shape for every fixture |
| Manual eval | `backend/scripts/evalAi.js` | calls real Groq API, validates output, saves to `backend/eval-outputs/` |
| Real repos | `backend/scripts/evalRealRepos.js` | fetches your public GitHub repos, runs `detectStack`, optionally generates + validates |

### Run the unit tests

```bash
cd backend
node --test tests/
```

450 tests, 0 failures.

### Run the manual AI eval (requires GROQ_API_KEY)

```bash
node --env-file=backend/.env backend/scripts/evalAi.js
```

Generates a Dockerfile and GitHub Actions workflow for all 10 stack fixtures, validates each one, and prints a summary. Raw outputs are saved to `backend/eval-outputs/` (gitignored).

### Run against your real repos

```bash
# detect stacks only (no API calls)
node --env-file=backend/.env backend/scripts/evalRealRepos.js

# detect + generate + validate (uses Groq API)
node --env-file=backend/.env backend/scripts/evalRealRepos.js --generate
```

### Day 13 eval result

Run on 2026-10-22 against all 10 fixtures using model `openai/gpt-oss-20b`:

| Fixture | Framework | Dockerfile | Workflow |
|---|---|---|---|
| vite-react | React (Vite) | ✅ | ✅ |
| vite-vue | Vue (Vite) | ✅ | ✅ |
| vite-vanilla | Vite | ✅ | ✅ |
| cra-app | React (CRA) | ✅ | ✅ |
| next-app | Next.js | ✅ | ✅ |
| express-api | Express | ✅ | ✅ |
| fastify-api | Fastify | ✅ | ✅ |
| koa-api | Koa | ✅ | ✅ |
| nestjs-api | NestJS | ✅ | ✅ |
| plain-node | Node.js | ✅ | ✅ |

**10/10 Dockerfiles passed — 10/10 Workflows passed — 0 prompt fixes needed.**

---

## Day 19 — Real-Time Log Streaming ✅

### What was built
Live Docker container and build log streaming using Server-Sent Events (SSE),
with a polling-based fallback for SSE-restricted environments.

### Backend
- `sseHelper.js` — SSE headers, event send, log line, stream close, disconnect hook
- `logStreamErrors.js` — stream error code constants and structured error mapping
- `logStreamService.js` — streamDockerLogs (Dockerode follow:true), pollDockerLogs (tail diff), streamBuildLogs (JSON line parser)
- `logStreamController.js` — handleStreamContainerLogs, handleStreamBuildLogs with input validation
- `logStreamRoutes.js` — /api/logs routes registered in index.js

### Frontend
- `useLogStream.js` — EventSource hook with exponential backoff reconnection, pause/resume/clear
- `LogStreamPanel.jsx` — terminal-style log viewer with status badge, download, reconnect button
- `Deploy.jsx` — LogStreamPanel wired up after successful deployment

### API Surface
| Endpoint | Description |
|----------|-------------|
| `GET /api/logs/:containerId/stream` | Live SSE container logs |
| `GET /api/logs/:containerId/stream?poll=true` | Polling fallback |
| `GET /api/logs/build/:imageTag/stream` | Build progress stream |

### Tests added (Day 19)
| Suite | Count |
|-------|-------|
| sseHelper.test.js | 14 |
| logStreamController.test.js | 12 |
| logStreamService.unit.test.js | 8 |
| **Total** | **34** |

### Up next — Day 20
Deployment status tracking — real-time status updates for running deployments.

---

## Day 20 — Deployment Status Tracking ✅

### What was built
Real-time deployment status tracking across the full pipeline —
queued → building → pushing → deploying → running | failed | stopped —
persisted to Supabase and streamed live to the frontend via SSE.

### Backend
- `deploymentStatusService.js` — updateDeploymentStatus, getDeploymentStatus, streamDeploymentStatus
- `deploymentStatusErrors.js` — error code constants and structured error mapping
- `deploymentStatusController.js` — GET, GET /stream, PATCH endpoints with full input validation
- `deploymentStatusRoutes.js` — /api/status routes registered in index.js
- `deployController.js` — updateDeploymentStatus wired at each pipeline step

### Frontend
- `useDeploymentStatus.js` — SSE hook with status history, metadata, exponential backoff reconnect
- `DeploymentStatusBadge.jsx` — colored status pill with sm/md/lg size variants
- `DeploymentTimeline.jsx` — vertical pipeline timeline with completed/active/failed/pending states
- `Deploy.jsx` — status badge, stream indicator, and pipeline timeline wired after deploy

### API Surface
| Endpoint | Description |
|----------|-------------|
| `GET /api/status/:deploymentId` | Current deployment status as JSON |
| `GET /api/status/:deploymentId/stream` | Live SSE status stream |
| `PATCH /api/status/:deploymentId` | Internal status update |

### Tests added (Day 20)
| Suite | Count |
|-------|-------|
| deploymentStatusService.unit.test.js | 16 |
| deploymentStatusController.test.js | 18 |
| **Day 20 Total** | **34** |
| **Cumulative (Day 19 + 20)** | **68** |

### Up next — Day 21
Buffer + testing — full end-to-end flow test, edge case fixes, and test suite cleanup.

---

## Day 21 — Buffer + Testing ✅

### What was built
Dedicated hardening day — fixed edge cases discovered during testing,
strengthened error handling across SSE and status services,
added 103 new tests, and polished the frontend log streaming UI.

### Bug Fixes
- `streamDeploymentStatus` — res.ended guards prevent write-after-end
- `pollDockerLogs` — fixed first-poll diff edge case with empty lastSeen
- `handleStreamBuildLogs` — verified import chain + res.ended guard
- `streamDockerLogs` — empty containerId guard before Dockerode call
- `getDeploymentStatus` — null/undefined/malformed Supabase row handling
- `LogStreamPanel` — per-status empty state icons and messages

### New Files
- `LogStreamErrorBoundary.jsx` — React error boundary for Deploy page
- `logStreamErrors.unit.test.js` — mapLogStreamError all branches
- `deploymentStatusErrors.unit.test.js` — mapDeploymentStatusError all branches
- `sseHelper.edge.test.js` — unicode, rapid fire, long lines, empty payloads
- `streamDeploymentStatus.unit.test.js` — polling loop, terminal status, disconnect
- `useLogStream.cleanup.test.js` — EventSource lifecycle, buffer cap, backoff
- `useDeploymentStatus.cleanup.test.js` — terminal guard, reconnect, history

### Test Summary
| Day | Tests Added | Running Total |
|-----|-------------|---------------|
| Day 1–18 | 480 | 480 |
| Day 19 | 34 | 514 |
| Day 20 | 34 | 548 |
| Day 21 | 35 | 583 |
| **Total** | | **583** |

### Up next — Day 22
Full flow end-to-end testing — GitHub → AI → Docker → ECR → EC2 → Logs → Status.
