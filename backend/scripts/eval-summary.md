# AI Eval Summary — Day 13

Run date: 2026-10-22
Model: openai/gpt-oss-20b
Fixtures: 10 (vite-react, vite-vue, vite-vanilla, cra-app, next-app, express-api, fastify-api, koa-api, nestjs-api, plain-node)

## Results

| Fixture       | Type      | Framework    | Dockerfile | Workflow | .dockerignore |
|---------------|-----------|--------------|------------|----------|---------------|
| vite-react    | frontend  | React (Vite) | ✅ 0/0     | ✅ 0/0   | ✅ generated  |
| vite-vue      | frontend  | Vue (Vite)   | ✅ 0/0     | ✅ 0/0   | ✅ generated  |
| vite-vanilla  | frontend  | Vite         | ✅ 0/0     | ✅ 0/0   | ✅ generated  |
| cra-app       | frontend  | React (CRA)  | ✅ 0/0     | ✅ 0/0   | ✅ generated  |
| next-app      | fullstack | Next.js      | ✅ 0/0     | ✅ 0/0   | ✅ generated  |
| express-api   | backend   | Express      | ✅ 0/0     | ✅ 0/0   | ✅ generated  |
| fastify-api   | backend   | Fastify      | ✅ 0/0     | ✅ 0/0   | ✅ generated  |
| koa-api       | backend   | Koa          | ✅ 0/0     | ✅ 0/0   | ✅ generated  |
| nestjs-api    | backend   | NestJS       | ✅ 0/0     | ✅ 0/0   | ✅ generated  |
| plain-node    | backend   | Node.js      | ✅ 0/0     | ✅ 0/0   | ✅ generated  |

Format: ✅/❌ errors/warnings

## Verdict

**Dockerfile    : 10/10 passed — 0 prompt fixes needed**
**Workflow      : 10/10 passed — 0 prompt fixes needed**
**.dockerignore : 10/10 generated — fixed rules per stack type**

Raw generated files are saved locally in `backend/eval-outputs/` (gitignored).

## Script flags (Day 14 polish)

```bash
# run all fixtures (default)
node --env-file=backend/.env backend/scripts/evalAi.js

# run a single fixture
node --env-file=backend/.env backend/scripts/evalAi.js --fixture express-api

# machine-readable JSON output
node --env-file=backend/.env backend/scripts/evalAi.js --json

# combine both
node --env-file=backend/.env backend/scripts/evalAi.js --fixture next-app --json
```
