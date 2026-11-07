# LaunchFlow — Backend API

Express.js + Supabase powered REST API for the LaunchFlow deployment platform.

## Tech Stack

- Node.js + Express.js
- Supabase (PostgreSQL)
- GitHub REST API v2022-11-28
- ES Modules

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy env example and fill in your values:
```bash
cp .env.example .env
```

3. Run schema in Supabase SQL Editor:
- `src/db/schema.sql`
- `src/db/policies.sql`

4. Start dev server:
```bash
npm run dev
```

## API Endpoints

### Deploy

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/deploy/trigger` | Trigger a new deployment |
| GET | `/api/deploy/status/:id` | Get deployment status |
| PATCH | `/api/deploy/status/:id` | Update deployment status |

### History

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | Get all deployments |
| GET | `/api/history/:id` | Get deployment by ID |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects` | Create a project |
| GET | `/api/projects` | Get all projects |
| GET | `/api/projects/:id` | Get project by ID |
| DELETE | `/api/projects/:id` | Delete a project |

### AI Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/dockerfile` | Generate Dockerfile from manual input |
| POST | `/api/ai/github-actions` | Generate GitHub Actions YAML from manual input |
| POST | `/api/ai/dockerfile/auto` | Auto-detect stack and generate Dockerfile |
| POST | `/api/ai/github-actions/auto` | Auto-detect stack and generate GitHub Actions YAML |

**Request body (manual endpoints):**
```json
{
  "repoName": "my-app",
  "language": "Node.js",
  "framework": "Express",
  "description": "A REST API server"
}
```

**Request body (auto endpoints):**
```json
{
  "owner": "github-username",
  "repo": "repository-name"
}
```

**Error codes returned in `code` field:**
| Code | Status | Meaning |
|------|--------|---------|
| `ai/too-long` | 502 | AI output was cut off (finish_reason: length) |
| `ai/empty-response` | 502 | AI returned empty content |
| `ai/timeout` | 504 | Groq did not respond within 30 s |
| `ai/rate-limited` | 429 | Groq rate limit hit |
| `ai/auth-failed` | 500 | Invalid GROQ_API_KEY |
| `ai/model-unavailable` | 500 | Configured model not found |
| `ai/service-unavailable` | 503 | Could not reach Groq |
| `ai/bad-gateway` | 502 | Unexpected Groq error |

### GitHub

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/github/repos/:username` | Fetch user's public repos |
| GET | `/api/github/repo/:owner/:repo` | Get repo details |
| GET | `/api/github/rate-limit` | Check GitHub API rate limit |

### Docker

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/docker/build` | Build a Docker image from a Dockerfile string |
| GET | `/api/docker/images` | List all local Docker images |
| DELETE | `/api/docker/images/:tag` | Remove an image by tag or ID |
| POST | `/api/docker/containers/run` | Create and start a container with port binding |
| POST | `/api/docker/containers/:id/stop` | Gracefully stop a running container |
| DELETE | `/api/docker/containers/:id` | Force-remove a container |
| GET | `/api/docker/containers/:id/logs` | Fetch stdout/stderr logs as plain text |

**Request body (POST /api/docker/build):**
```json
{
  "dockerfileContent": "FROM node:20-alpine\n...",
  "tag": "myapp:latest"
}
```

**Request body (POST /api/docker/containers/run):**
```json
{
  "imageTag": "myapp:latest",
  "hostPort": 3000,
  "containerPort": 3000,
  "name": "my-container"
}
```

**Error codes returned in `code` field:**
| Code | Status | Meaning |
|------|--------|---------|
| `docker/not-found` | 404 | Image or container not found |
| `docker/conflict` | 409 | Name already in use |
| `docker/unprocessable` | 422 | Invalid Dockerfile |
| `docker/build-failed` | 422 | Build stream returned an error |
| `docker/daemon-error` | 502 | Docker daemon internal error |
| `docker/daemon-unavailable` | 503 | Docker daemon not running |
| `docker/bad-gateway` | 502 | Unexpected Docker error |
| `docker/invalid-input` | 400 | Missing or invalid request field |

### EC2

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ec2/launch` | Launch a new EC2 instance |
| GET | `/api/ec2/instances` | List all LaunchFlow-managed instances |
| GET | `/api/ec2/instances/:id` | Describe an instance — state, IP, DNS |
| POST | `/api/ec2/instances/:id/stop` | Stop a running instance |
| POST | `/api/ec2/instances/:id/start` | Start a stopped instance |
| DELETE | `/api/ec2/instances/:id` | Permanently terminate an instance |

**Request body (POST /api/ec2/launch):**
```json
{
  "name": "my-app-server",
  "ami": "ami-0c02fb55956c7d316",
  "instanceType": "t2.micro",
  "keyPairName": "my-key-pair",
  "securityGroupId": "sg-0abc123def456"
}
```

**Error codes returned in `code` field:**
| Code | Status | Meaning |
|------|--------|---------|
| `ec2/not-found` | 404 | Instance or AMI ID does not exist |
| `ec2/invalid-input` | 400 | Malformed instance ID or bad request field |
| `ec2/auth-failed` | 500 | Invalid AWS credentials |
| `ec2/request-expired` | 400 | Server clock out of sync with AWS |
| `ec2/limit-exceeded` | 429 | Account instance limit hit |
| `ec2/insufficient-capacity` | 503 | AWS capacity unavailable for this type/region |
| `ec2/service-unavailable` | 503 | Could not reach AWS EC2 service |
| `ec2/bad-gateway` | 502 | Unexpected AWS error |

### Nginx

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/nginx/generate` | Generate basic reverse proxy config |
| POST | `/api/nginx/generate/stack` | Generate stack-aware Nginx config |
| POST | `/api/nginx/generate/ssl` | Generate HTTPS + SSL termination config |
| POST | `/api/nginx/validate` | Validate an Nginx config string |
| POST | `/api/ai/nginx` | AI-powered Nginx config generation via Groq |

**Request body (POST /api/nginx/generate):**
```json
{
  "domain": "example.com",
  "port": 3000,
  "appName": "my-app"
}
```

**Request body (POST /api/nginx/generate/stack):**
```json
{
  "domain": "example.com",
  "type": "frontend",
  "port": 3000,
  "buildOutput": "dist",
  "appName": "my-app"
}
```

**Error codes returned in `code` field:**
| Code | Status | Meaning |
|------|--------|---------|
| `nginx/invalid-input` | 400 | Missing or malformed request field |
| `nginx/invalid-config` | 422 | Generated config failed validation |
| `nginx/bad-gateway` | 502 | Unexpected internal error |

### ECR (Elastic Container Registry)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ecr/repositories` | Create a new ECR repository |
| GET | `/api/ecr/repositories` | List all ECR repositories |
| DELETE | `/api/ecr/repositories/:name` | Delete a repository and all its images |
| POST | `/api/ecr/push` | Tag and push a local image to ECR |
| GET | `/api/ecr/repositories/:name/images` | List images in a repository |
| DELETE | `/api/ecr/repositories/:name/images` | Delete an image by tag or digest |

**Request body (POST /api/ecr/repositories):**
```json
{
  "repositoryName": "myapp"
}
```

**Request body (POST /api/ecr/push):**
```json
{
  "localTag": "myapp:latest",
  "repositoryUri": "123456789.dkr.ecr.us-east-1.amazonaws.com/myapp",
  "imageTag": "latest"
}
```

**Request body (DELETE /api/ecr/repositories/:name/images):**
```json
{
  "imageTag": "latest"
}
```

**Error codes returned in `code` field:**
| Code | Status | Meaning |
|------|--------|---------|
| `ecr/not-found` | 404 | Repository or image does not exist |
| `ecr/already-exists` | 409 | Repository name already taken |
| `ecr/invalid-input` | 400 | Malformed request field |
| `ecr/auth-failed` | 500 | Invalid AWS credentials |
| `ecr/no-auth-token` | 502 | ECR did not return an auth token |
| `ecr/tag-failed` | 422 | Local image tag failed |
| `ecr/push-failed` | 422 | Image push to ECR failed |
| `ecr/limit-exceeded` | 429 | Repository limit exceeded |
| `ecr/service-unavailable` | 503 | Could not reach AWS ECR service |
| `ecr/bad-gateway` | 502 | Unexpected AWS ECR error |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health check |

## 🧪 Testing

All backend utilities and middleware are covered with unit tests using Node.js built-in `node:test` framework.

### Run all tests

```bash
node --test backend/tests/
```

### Test files

| File | What it covers |
|---|---|
| `aiController.test.js` | Input validation guards (400 responses) |
| `aiErrors.test.js` | Groq error mapping → status codes + error codes |
| `aiService.error.test.js` | ai/too-long + ai/empty-response branch coverage |
| `aiService.integration.test.js` | aiService export shape smoke tests |
| `dockerErrors.test.js` | Docker error mapping → status codes + error codes |
| `dockerController.test.js` | Docker endpoint input validation guards (400 responses) |
| `dockerService.unit.test.js` | dockerService functions with mocked Docker client |
| `ec2Errors.test.js` | AWS error code mapping → status codes + error codes |
| `ec2Controller.test.js` | EC2 endpoint input validation guards (400 responses) |
| `ec2Service.unit.test.js` | ec2Service functions with mocked AWS SDK client |
| `ecrErrors.test.js` | AWS ECR error code mapping → status codes + error codes |
| `ecrController.test.js` | ECR endpoint input validation guards (400 responses) |
| `ecrService.unit.test.js` | ecrService functions with mocked AWS ECR client |
| `validateNginxConfig.test.js` | Nginx config validation rules — errors + warnings |
| `nginxController.test.js` | Nginx endpoint input validation guards (400 responses) |
| `nginxService.unit.test.js` | nginxService config generator coverage |
| `asyncHandler.test.js` | Async error forwarding to next() |
| `cleanAiOutput.test.js` | Fenced code block extraction |
| `cleanAiOutput.edge.test.js` | Edge cases — empty, nested fences, whitespace |
| `detectStack.test.js` | Framework + type detection from package.json |
| `detectStack.stacks.test.js` | Full fixture coverage across 12 stack fixtures |
| `errorHandler.test.js` | Global error middleware response shape |
| `generateDockerignore.test.js` | Dockerignore content by stack type |
| `healthRoute.test.js` | /health response shape |
| `notFound.test.js` | 404 middleware response shape |
| `parseOwnerRepo.test.js` | GitHub URL + owner/repo string parsing |
| `promptRules.test.js` | Prompt rule injection per stack type |
| `rateLimit.test.js` | In-memory rate limiting per IP key |
| `requestLogger.test.js` | Request logging middleware output |
| `sanitizeInput.test.js` | Input trimming + character length limiting |
| `utils.test.js` | Shared utility helpers |
| `validateDockerfile.test.js` | Dockerfile lint rules — errors + warnings |
| `validateJson.test.js` | JSON body parsing middleware |
| `validateWorkflow.test.js` | GitHub Actions YAML lint rules |
| `workflowRules.test.js` | Workflow rule string generation per stack |

## Environment Variables

See `.env.example` for all required variables.

---

## Real-Time Log Streaming (Day 19)

LaunchFlow supports live Docker container and build log streaming via
Server-Sent Events (SSE). All log streaming logic is fully separated
from the existing deploy pipeline.

### Architecture

Client (EventSource)
└── GET /api/logs/:containerId/stream
└── logStreamController.js
├── streamDockerLogs() — Dockerode follow:true SSE stream
└── pollDockerLogs() — polling fallback (?poll=true)

Client (EventSource)
└── GET /api/logs/build/:imageTag/stream
└── logStreamController.js
└── streamBuildLogs() — Docker build progress JSON line parser


### New Files

| File | Purpose |
|------|---------|
| `src/utils/sseHelper.js` | SSE headers, event send, stream close, disconnect hook |
| `src/utils/logStreamErrors.js` | Stream error code constants and error mapping |
| `src/services/logStreamService.js` | streamDockerLogs, pollDockerLogs, streamBuildLogs |
| `src/controllers/logStreamController.js` | handleStreamContainerLogs, handleStreamBuildLogs |
| `src/routes/logStreamRoutes.js` | /api/logs route definitions |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/logs/:containerId/stream` | Stream live container logs via SSE |
| GET | `/api/logs/:containerId/stream?poll=true` | Polling fallback for SSE-restricted environments |
| GET | `/api/logs/build/:imageTag/stream` | Stream Docker image build progress via SSE |

### Query Parameters

| Param | Default | Description |
|-------|---------|-------------|
| `poll` | `false` | Set to `true` to use polling fallback |
| `tail` | `50` | Number of lines fetched per poll cycle |
| `interval` | `2000` | Polling interval in milliseconds |

### SSE Event Shape

Every event sent to the client follows one of two shapes:

**Log line event:**
```json
{
  "event": "log",
  "data": { "line": "npm install complete", "stream": "stdout", "ts": 1234567890 }
}
```

**Terminal status event:**
```json
{
  "event": "status",
  "data": { "status": "done", "message": "Container log stream ended." }
}
```

Status values: `done` | `error`

### Running Log Streaming Tests

```bash
# Run all log streaming related tests
node --test tests/sseHelper.test.js
node --test tests/logStreamController.test.js
node --test tests/logStreamService.unit.test.js

# Run full backend test suite
npm test
```

### Test Count (Day 19)

| File | Tests |
|------|-------|
| `sseHelper.test.js` | 14 |
| `logStreamController.test.js` | 12 |
| `logStreamService.unit.test.js` | 8 |
| **Day 19 Total** | **34** |

---

## Deployment Status Tracking (Day 20)

### New Files

| File | Purpose |
|------|---------|
| `src/services/deploymentStatusService.js` | updateDeploymentStatus, getDeploymentStatus, streamDeploymentStatus |
| `src/utils/deploymentStatusErrors.js` | Error code constants and structured error mapping |
| `src/controllers/deploymentStatusController.js` | handleGetDeploymentStatus, handleStreamDeploymentStatus, handleUpdateDeploymentStatus |
| `src/routes/deploymentStatusRoutes.js` | /api/status route definitions |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/status/:deploymentId` | Get current deployment status as JSON |
| GET | `/api/status/:deploymentId/stream` | Stream live status updates via SSE |
| PATCH | `/api/status/:deploymentId` | Update deployment status (internal) |

### Query Parameters

| Param | Default | Description |
|-------|---------|-------------|
| `interval` | `2000` | SSE polling interval in ms (clamped 500–10000) |

### SSE Event Shape

**Status change event:**
```json
{
  "event": "status",
  "data": {
    "deploymentId": "dep-123",
    "status": "building",
    "updatedAt": "2026-10-24T10:00:00.000Z",
    "error": null,
    "imageTag": null,
    "containerId": null
  }
}
```

**Terminal status event (stream closes after this):**
```json
{
  "event": "status",
  "data": { "status": "done", "message": "Deployment reached terminal status: running" }
}
```

### PATCH Request Body

```json
{
  "status": "building",
  "imageTag": "myapp:v1.0",
  "containerId": "abc123def456"
}
```

### Running Status Tracking Tests

```bash
# Run Day 20 tests individually
node --test tests/deploymentStatusService.unit.test.js
node --test tests/deploymentStatusController.test.js

# Run full backend test suite
npm test
```

### Test Count (Day 20)

| File | Tests |
|------|-------|
| `deploymentStatusService.unit.test.js` | 16 |
| `deploymentStatusController.test.js` | 18 |
| **Day 20 Total** | **34** |
| **Cumulative Total** | **68** |

---

## Day 21 — Buffer + Testing

Dedicated buffer day focused on hardening the codebase built in
Day 19 (SSE log streaming) and Day 20 (deployment status tracking).

### What was fixed
- `streamDeploymentStatus` — added `res.ended` guards to prevent write-after-end on client disconnect
- `pollDockerLogs` — improved index-based diff logic to fix first-poll edge case with empty lastSeen
- `handleStreamBuildLogs` — verified import chain and added `res.ended` guard
- `streamDockerLogs` — added empty containerId guard before Dockerode call
- `getDeploymentStatus` — strengthened null/undefined/malformed row checks from Supabase

### What was added
- `LogStreamErrorBoundary.jsx` — React error boundary prevents Deploy page crash
- `LogStreamPanel` — polished empty state UI with per-status icons and messages
- `DeploymentTimeline` — added stopped status display with completed steps and footer message

### New Test Files (Day 21)

| File | Tests |
|------|-------|
| `logStreamErrors.unit.test.js` | 18 |
| `deploymentStatusErrors.unit.test.js` | 18 |
| `sseHelper.edge.test.js` | 20 |
| `streamDeploymentStatus.unit.test.js` | 10 |
| `useLogStream.cleanup.test.js` (frontend) | 17 |
| `useDeploymentStatus.cleanup.test.js` (frontend) | 20 |
| **Day 21 Total** | **103** |

### Cumulative Test Count

| Day | Tests Added | Running Total |
|-----|-------------|---------------|
| Day 1–18 | 480 | 480 |
| Day 19 | 34 | 514 |
| Day 20 | 34 | 548 |
| Day 21 | 35 | 583 |
| **Total** | | **583** |

### Running Day 21 Tests

```bash
# Error mapping tests
node --test tests/logStreamErrors.unit.test.js
node --test tests/deploymentStatusErrors.unit.test.js

# SSE edge cases
node --test tests/sseHelper.edge.test.js

# Status stream tests
node --test tests/streamDeploymentStatus.unit.test.js

# Full backend suite
npm test
```

---

## Day 22 — Full Flow End-to-End Integration Testing

**Goal:** GitHub → AI → Docker → ECR → EC2 → Logs → Status — full pipeline tested end-to-end with zero integration gaps.

### Integration Test Suite Added
| File | Coverage |
|------|----------|
| `tests/integration/helpers/startServer.js` | Shared test server boot/stop helper |
| `tests/integration/healthCheck.test.js` | Server boot, /api/health, 404 fallback, route registration |
| `tests/integration/githubFlow.test.js` | Repo fetch, file read, input validation |
| `tests/integration/aiFlow.test.js` | Dockerfile + workflow generation, malformed JSON |
| `tests/integration/dockerFlow.test.js` | Build/run/stop validation, daemon unreachable guard |
| `tests/integration/deployFlow.test.js` | Full pipeline mock, null deploymentId guard, status UUID |
| `tests/integration/logStreamFlow.test.js` | SSE headers, keep-alive, data event, invalid UUID |
| `tests/integration/statusFlow.test.js` | Status enum guard, SSE stream, UUID validation |
| `tests/integration/errorFlow.test.js` | All error paths — malformed JSON, empty body, extreme inputs |

### Backend Fixes
- `deployController.js` — null/invalid deploymentId guard added
- `githubController.js` — empty repo and null owner/username guard added
- `aiController.js` — malformed Groq response guard, safe optional chaining
- `dockerController.js` — Docker daemon unreachable ECONNREFUSED handler

### Frontend Updates
- `useGitHub.js` — granular error states for 404/403/400, rate limit, offline
- `useDeploy.js` — robust deploymentId/containerId extraction, reset function
- `Deploy.jsx` — per-step loading labels, spinner states, error alerts, log stream wiring

### Test Results
- **691 tests / 208 suites — 0 failures**
- 108 new integration tests added on top of 583 existing unit tests
