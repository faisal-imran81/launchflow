# LaunchFlow — Frontend

React 19 client application for the LaunchFlow deployment platform. Built with Vite, Tailwind CSS 3, and Supabase Auth. Provides a full deployment workflow UI — from GitHub repo search to real-time log streaming.

---

## Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework |
| Vite | 6.x | Build tool + dev server |
| Tailwind CSS | 3.x | Utility-first styling |
| Supabase JS | Latest | Auth + database client |

---

## Getting Started

### Install Dependencies

```bash
cd frontend
npm install
```

### Configure Environment

```bash
cp .env.example .env
```

Fill in all required values in `.env`. See `.env.example` for descriptions of each variable.

### Start Development Server

```bash
npm run dev
```

App runs on `http://localhost:5173` by default.

### Build for Production

```bash
npm run build
```

---

## Project Structure

```
frontend/src/
├── main.jsx                       # App entry point
├── App.jsx                        # Root component + route definitions
├── index.css                      # Global styles + Tailwind directives
├── config/
│   └── supabase.js                # Supabase client initialization
├── pages/                         # Top-level route pages
│   ├── Dashboard.jsx              # Projects overview page
│   ├── Deploy.jsx                 # Full deployment workflow page
│   ├── History.jsx                # Deployment history page
│   └── NotFound.jsx               # 404 page
├── components/                    # Reusable UI components (17 total)
│   ├── AIEngine.jsx               # AI generation panel
│   ├── AIOutput.jsx               # Generated Dockerfile + workflow display
│   ├── AutoDetectForm.jsx         # Stack auto-detection form
│   ├── DeployForm.jsx             # Deployment trigger form
│   ├── DeploymentCard.jsx         # Single deployment summary card
│   ├── DeploymentStatusBadge.jsx  # Status indicator badge
│   ├── DeploymentTimeline.jsx     # Step-by-step deployment progress
│   ├── EmptyState.jsx             # Empty state placeholder UI
│   ├── ErrorAlert.jsx             # Error message display
│   ├── LogStreamErrorBoundary.jsx # Error boundary for log stream
│   ├── LogStreamPanel.jsx         # Real-time SSE log display panel
│   ├── ManualGenerateForm.jsx     # Manual Dockerfile + workflow generator
│   ├── Navbar.jsx                 # Top navigation bar
│   ├── OutputTabs.jsx             # Tabbed output switcher
│   ├── RepoList.jsx               # GitHub repository list
│   ├── RepoSearchBar.jsx          # GitHub username search input
│   ├── Sidebar.jsx                # Side navigation
│   ├── SkeletonCard.jsx           # Loading skeleton placeholder
│   ├── Spinner.jsx                # Loading spinner
│   ├── StatusBadge.jsx            # Deployment status badge
│   └── SuccessToast.jsx           # Success notification toast
├── hooks/                         # Custom React hooks (8 total)
│   ├── useAI.js                   # AI generation state + handlers
│   ├── useDeploy.js               # Deployment trigger + pipeline state
│   ├── useDeploymentStatus.js     # Real-time deployment status via SSE
│   ├── useGitHub.js               # GitHub repo search + fetch
│   ├── useHistory.js              # Deployment history fetch + state
│   ├── useLogStream.js            # Live container log streaming via SSE
│   ├── usePageTitle.js            # Dynamic browser tab title
│   └── useProjects.js             # Projects fetch + management
├── services/                      # API call layer (7 files)
│   ├── api.js                     # Base Axios/fetch instance + interceptors
│   ├── aiService.js               # AI generation API calls
│   ├── deployService.js           # Deployment trigger API calls
│   ├── deploymentsService.js      # Deployment status API calls
│   ├── githubService.js           # GitHub API calls
│   ├── historyService.js          # History API calls
│   └── projectsService.js         # Projects API calls
└── utils/
    ├── aiErrorMessages.js         # Human-readable AI error messages
    └── parseRepoInput.js          # Parse GitHub repo URL input
```

---

## Pages

### Dashboard
- Displays all tracked projects as cards
- Shows latest deployment status per project
- Quick-access actions for each project

### Deploy
- GitHub username search to fetch public repositories
- Repository selection with stack auto-detection
- AI Engine tab: view generated Dockerfile and GitHub Actions workflow
- One-click deployment trigger
- Real-time log streaming panel via SSE
- Live deployment status timeline

### History
- Full list of all past deployments
- Each record shows repository, stack, status, and timestamps
- Failed deployments include error details

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Charcoal | `#0c0c0c` | Primary background |
| Forest Green | `#52b788` | Primary accent, success states |
| Crimson | `#e53e3e` | Error states, destructive actions |

---

## Environment Variables

See `.env.example` for the full list of required variables with descriptions.
