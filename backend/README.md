# LaunchFlow — Backend API

Express.js + Supabase powered REST API for the LaunchFlow deployment platform.

## Tech Stack

- Node.js + Express.js
- Supabase (PostgreSQL)
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

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health check |

## Environment Variables

See `.env.example` for all required variables.
