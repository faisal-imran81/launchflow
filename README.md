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
| Day 17 | AWS ECR — push Docker images to a private registry |
| Day 18 | Nginx configuration — reverse proxy for the deployed app |
| Day 19 | Real-time log streaming — live container logs in the UI |
| Day 20 | Deployment status tracking — polling + status updates in Supabase |
| Day 21 | Buffer + integration testing |

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

**361 tests, 0 failures** — no extra dependencies, no network calls.

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

361 tests, 0 failures.

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
