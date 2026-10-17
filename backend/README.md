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
node --test backend/tests/*.test.js
```

### Test files

| File | What it covers |
|---|---|
| `aiErrors.test.js` | Groq error mapping → status codes + codes |
| `errorHandler.test.js` | Global error middleware response shape |
| `aiController.test.js` | Input validation guards (400 responses) |
| `cleanAiOutput.test.js` | Fenced code block extraction |
| `detectStack.test.js` | Framework + type detection from package.json |
| `workflowRules.test.js` | GitHub Actions YAML rule generation |
| `notFound.test.js` | 404 middleware response shape |
| `generateDockerignore.test.js` | Dockerignore content by stack type |
| `sanitizeInput.test.js` | Input trimming + length limiting |
| `asyncHandler.test.js` | Async error forwarding to next() |
| `healthRoute.test.js` | /api/health response shape |
| `parseOwnerRepo.test.js` | GitHub URL + owner/repo parsing |
| `rateLimit.test.js` | In-memory rate limiting per key |
| `aiService.integration.test.js` | aiService export shape smoke tests |

## Environment Variables

See `.env.example` for all required variables.
