<div align="center">

# 🚀 LaunchFlow

### AI-powered deployment platform — from GitHub repo to live server in minutes.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/AI-Groq-F55036?style=flat-square)](https://groq.com/)
[![AWS](https://img.shields.io/badge/AWS-EC2%20%2B%20ECR-FF9900?style=flat-square&logo=amazonaws&logoColor=white)](https://aws.amazon.com/)
[![Tests](https://img.shields.io/badge/Tests-691%20passing-52b788?style=flat-square)](#testing)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

</div>

---

> Paste a GitHub repo URL. LaunchFlow's AI engine analyzes your codebase, generates a production-ready `Dockerfile` and GitHub Actions workflow, builds a Docker image, pushes it to AWS ECR, deploys it to AWS EC2, and streams real-time logs — all from a single click.

---

## ✨ Features

- **AI-Powered Generation** — Groq LLM analyzes your repository and auto-generates a production-ready `Dockerfile` and GitHub Actions CI/CD workflow
- **Stack Auto-Detection** — Automatically detects Node.js, Python, Go, Java, Ruby, PHP, Rust, and more from your repo's file structure
- **Docker Integration** — Builds, tags, and manages Docker images locally before pushing to the registry
- **AWS ECR Support** — Pushes built images directly to your Amazon Elastic Container Registry
- **AWS EC2 Deployment** — Deploys containers to your EC2 instance with zero manual SSH required
- **Nginx Configuration** — Auto-generates and applies reverse proxy config for your deployed app
- **Real-Time Log Streaming** — Server-Sent Events (SSE) stream live Docker and deployment logs to the browser
- **Deployment History** — Full audit trail of every deployment with status, timestamps, and logs
- **Project Management** — Organize and track multiple projects and their deployment lifecycles
- **691 Tests** — Comprehensive unit, integration, and E2E test coverage

---
## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        LaunchFlow                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   User pastes GitHub URL                                    │
│        │                                                    │
│        ▼                                                    │
│   ┌─────────────┐        ┌──────────────┐                   │
│   │  React 19   │───────▶│  Express 5   │                   │
│   │  Frontend   │◀───────│  Backend     │                   │
│   └─────────────┘        └──────┬───────┘                   │
│                                 │                           │
│        ┌───────────────────┼───────────────────┐           │
│        ▼                   ▼                   ▼           │
│   ┌─────────────┐    ┌──────────────┐    ┌──────────────┐   │
│   │  Groq API   │    │   Supabase   │    │  GitHub API  │   │
│   │ (AI Engine) │    │ (PostgreSQL) │    │ (Repo Data)  │   │
│   └─────────────┘    └──────────────┘    └──────────────┘   │
│                                 │                           │
│                                 ▼                           │
│   ┌─────────────┐                                           │
│   │   Docker    │        Build image locally                │
│   └──────┬──────┘                                           │
│          │                                                  │
│          ▼                                                  │
│   ┌─────────────┐                                           │
│   │   AWS ECR   │        Push image to registry             │
│   └──────┬──────┘                                           │
│          │                                                  │
│          ▼                                                  │
│   ┌─────────────┐                                           │
│   │   AWS EC2   │        Pull + run container               │
│   └──────┬──────┘                                           │
│          │                                                  │
│          ▼                                                  │
│   ┌─────────────┐                                           │
│   │    Nginx    │        Reverse proxy to container         │
│   └─────────────┘                                           │
│                                                             │
│   Real-time logs streamed back via SSE  ──────▶  Frontend   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---
## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20.x | Runtime |
| Express | 5.x | HTTP framework |
| Supabase | Latest | PostgreSQL database + auth |
| Groq API | Latest | LLM for AI generation |
| Docker SDK | Latest | Image build + container management |
| AWS SDK v3 | Latest | ECR + EC2 integration |
| ESM Modules | Native | Modern JS module system |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework |
| Vite | 6.x | Build tool + dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| Supabase JS | Latest | Auth + realtime client |

### Infrastructure
| Service | Purpose |
|---------|---------|
| AWS EC2 | Deployment target server |
| AWS ECR | Docker image registry |
| Nginx | Reverse proxy |
| GitHub API | Repository data fetching |

### Testing
| Tool | Purpose |
|------|---------|
| Node.js built-in test runner | Unit + integration tests |
| 691 total tests | Full coverage across backend + frontend |

---
## 📦 Installation

### Prerequisites

Before you begin, make sure you have the following installed and configured:

- **Node.js** v20.x or higher
- **npm** v10.x or higher
- **Docker** (running locally)
- **Git**
- A **Supabase** project (PostgreSQL database)
- A **Groq API** key — [get one free at console.groq.com](https://console.groq.com)
- **AWS Account** with EC2 and ECR access
- A **GitHub Personal Access Token** (for repo fetching)

---

### 1. Clone the Repository

```bash
git clone https://github.com/faisal-imran81/launchflow.git
cd launchflow
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your credentials in .env
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
# Fill in your credentials in .env
```

### 4. Run the Development Servers

**Backend** (runs on `http://localhost:3000`):
```bash
cd backend
npm run dev
```

**Frontend** (runs on `http://localhost:5173`):
```bash
cd frontend
npm run dev
```

> Both servers must be running simultaneously for the app to function correctly.

---
## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Port the Express server runs on (default: `3000`) |
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side) |
| `GROQ_API_KEY` | Yes | Groq API key for LLM-powered generation |
| `GITHUB_TOKEN` | Yes | GitHub Personal Access Token for repo fetching |
| `AWS_ACCESS_KEY_ID` | Yes | AWS IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | Yes | AWS IAM user secret key |
| `AWS_REGION` | Yes | AWS region (e.g. `us-east-1`) |
| `AWS_ACCOUNT_ID` | Yes | Your 12-digit AWS account ID |
| `ECR_REGISTRY` | Yes | Full ECR registry URL (e.g. `123456789.dkr.ecr.us-east-1.amazonaws.com`) |
| `EC2_HOST` | Yes | Public IP or DNS of your EC2 instance |
| `EC2_USERNAME` | Yes | SSH username for EC2 (e.g. `ubuntu`) |
| `EC2_SSH_KEY_PATH` | Yes | Absolute path to your EC2 `.pem` key file |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key (client-side) |
| `VITE_API_URL` | Yes | Backend API base URL (e.g. `http://localhost:3000`) |

> ⚠️ Never commit `.env` files to version control. Both are listed in `.gitignore`.

---
## 📖 Usage

### Deploying a Repository

1. **Open the Deploy page** from the sidebar navigation
2. **Search for a GitHub repository** by entering a GitHub username — LaunchFlow fetches all public repositories
3. **Select a repository** from the list — LaunchFlow analyzes the codebase and auto-detects the stack
4. **Review AI-generated files** — the AI Engine tab shows the generated `Dockerfile` and GitHub Actions workflow
5. **Trigger deployment** — click Deploy to start the full pipeline:
   - Docker image is built locally
   - Image is tagged and pushed to AWS ECR
   - EC2 instance pulls and runs the container
   - Nginx reverse proxy is configured automatically
6. **Monitor real-time logs** — the Log Stream panel streams live deployment output via SSE
7. **Check deployment status** — status badge updates in real time (Pending → Building → Deploying → Live / Failed)

### Viewing Deployment History

- Navigate to the **History page** to see all past deployments
- Each entry shows repository name, stack, status, timestamps, and deployment ID
- Failed deployments include error details for debugging

### Managing Projects

- Navigate to the **Dashboard** to see all tracked projects
- Each project card shows the latest deployment status and quick-access actions

### Running Tests

```bash
# From the backend directory
cd backend
npm test
```

> 691 tests across unit, integration, and end-to-end suites — all passing.

---
## 🔌 API Endpoints

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |

### AI Engine
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/dockerfile` | Generate a Dockerfile for a given repository |
| `POST` | `/api/ai/github-actions` | Generate a GitHub Actions workflow YAML |

### Deployment
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/deploy/trigger` | Trigger a full deployment pipeline |
| `GET` | `/api/status/:deploymentId` | Get current status of a deployment |
| `GET` | `/api/status/:deploymentId/stream` | Stream real-time deployment status via SSE |

### Docker
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/docker/build` | Build a Docker image locally |
| `GET` | `/api/docker/images` | List all local Docker images |
| `DELETE` | `/api/docker/images/:imageId` | Remove a local Docker image |
| `GET` | `/api/logs/:containerId/stream` | Stream live container logs via SSE |

### GitHub
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/github/repos/:username` | Fetch all public repositories for a GitHub user |
| `GET` | `/api/github/repo/:owner/:repo` | Fetch metadata and file tree for a specific repo |

### AWS ECR
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ecr/create-repository` | Create a new ECR repository |
| `POST` | `/api/ecr/push` | Tag and push a Docker image to ECR |
| `GET` | `/api/ecr/repositories` | List all ECR repositories |

### AWS EC2
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ec2/deploy` | Pull and run a container on the EC2 instance |
| `GET` | `/api/ec2/status` | Check EC2 instance connectivity |

### Nginx
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/nginx/configure` | Generate and apply Nginx reverse proxy config |
| `GET` | `/api/nginx/status` | Check Nginx service status on EC2 |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create a new project |
| `DELETE` | `/api/projects/:id` | Delete a project |

### History
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/history` | List all deployment history records |
| `GET` | `/api/history/:id` | Get details of a specific deployment record |

---
## 📁 Project Structure

```
launchflow/
├── README.md                      # Project documentation (this file)
├── CONTRIBUTING.md                # Contribution guidelines
│
├── backend/                       # Express 5 API server
│   ├── .env.example               # Environment variables template
│   ├── package.json
│   ├── src/
│   │   ├── index.js               # Server entry point
│   │   ├── config/                # Service configuration
│   │   │   ├── docker.js          # Docker client config
│   │   │   ├── ec2.js             # AWS EC2 client config
│   │   │   ├── ecr.js             # AWS ECR client config
│   │   │   ├── groq.js            # Groq API client config
│   │   │   └── supabase.js        # Supabase client config
│   │   ├── controllers/           # Route handler logic (12 controllers)
│   │   ├── routes/                # Express route definitions (12 route files)
│   │   ├── services/              # Business logic layer (10 services)
│   │   │   ├── aiService.js               # Groq LLM integration
│   │   │   ├── dockerService.js           # Docker build + management
│   │   │   ├── ec2Service.js              # EC2 deploy + SSH
│   │   │   ├── ecrService.js              # ECR push + registry
│   │   │   ├── githubService.js           # GitHub API integration
│   │   │   ├── logStreamService.js        # SSE log streaming
│   │   │   ├── nginxService.js            # Nginx config generation
│   │   │   ├── repoAnalysisService.js     # Stack detection + repo analysis
│   │   │   ├── repoFilesService.js        # Repository file fetching
│   │   │   └── deploymentStatusService.js # Deployment status tracking
│   │   ├── middleware/            # Express middleware
│   │   │   ├── errorHandler.js    # Global error handler
│   │   │   ├── notFound.js        # 404 handler
│   │   │   ├── requestLogger.js   # HTTP request logging
│   │   │   └── validateJson.js    # JSON body validation
│   │   ├── db/                    # Database layer
│   │   │   ├── projectsService.js     # Projects CRUD
│   │   │   ├── deploymentsService.js  # Deployments CRUD
│   │   │   ├── schema.sql             # Database schema
│   │   │   └── policies.sql           # Row-level security policies
│   │   └── utils/                 # Shared utilities (17 files)
│   │       ├── detectStack.js         # Stack auto-detection logic
│   │       ├── validateDockerfile.js
│   │       ├── validateWorkflow.js
│   │       ├── validateNginxConfig.js
│   │       ├── cleanAiOutput.js       # Sanitize LLM responses
│   │       ├── sseHelper.js           # SSE stream helpers
│   │       ├── generateDockerignore.js
│   │       ├── asyncHandler.js        # Async error wrapper
│   │       ├── parseOwnerRepo.js      # GitHub URL parser
│   │       ├── rateLimit.js           # API rate limiting
│   │       └── sanitizeInput.js       # Input sanitization
│   ├── tests/                     # 691 passing tests
│   │   ├── unit/                  # ~45 unit test files
│   │   ├── integration/           # 9 integration suites
│   │   └── fixtures/              # Test data + stack fixtures
│   └── eval-outputs/              # AI evaluation outputs (10 stacks)
│
└── frontend/                      # React 19 + Vite client
    ├── .env.example               # Environment variables template
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx               # App entry point
        ├── App.jsx                # Root component + routing
        ├── config/
        │   └── supabase.js        # Supabase client config
        ├── pages/                 # Top-level route pages
        │   ├── Dashboard.jsx      # Projects overview
        │   ├── Deploy.jsx         # Deployment workflow
        │   ├── History.jsx        # Deployment history
        │   └── NotFound.jsx       # 404 page
        ├── components/            # Reusable UI components (17 components)
        ├── hooks/                 # Custom React hooks (8 hooks)
        │   ├── useAI.js               # AI generation state
        │   ├── useDeploy.js           # Deployment trigger + state
        │   ├── useDeploymentStatus.js # Real-time status polling
        │   ├── useGitHub.js           # GitHub repo fetching
        │   ├── useHistory.js          # Deployment history
        │   ├── useLogStream.js        # SSE log streaming
        │   ├── usePageTitle.js        # Dynamic page titles
        │   └── useProjects.js         # Projects management
        ├── services/              # API call layer (7 files)
        └── utils/                 # Frontend utilities
```

---
