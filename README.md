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

## Features

- 🔍 Search your GitHub repos directly from the deploy form
- 🚀 One-click deployment trigger
- 📋 Full deployment history with status tracking
- 🗑 Delete deployments from the UI
- 📊 Dashboard with live deployment stats
- ⚡ Real-time loading skeletons
- 🌐 404 page with redirect

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
- [ ] Week 2 — AI Engine (Groq API)
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

The tests cover stack detection (`detectStack`), the workflow rules builder (`getWorkflowRules`, including the lowercase Docker image name) and the AI output cleaner (`cleanAiOutput`). They do not call the Groq API.
