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
