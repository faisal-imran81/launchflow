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
