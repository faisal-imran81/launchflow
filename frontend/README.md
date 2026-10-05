# LaunchFlow — Frontend

React + Vite + Tailwind CSS powered frontend for the LaunchFlow deployment platform.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Supabase JS Client
- Axios
- React Router DOM

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy env example and fill in your values:
```bash
cp .env.example .env
```

3. Start dev server:
```bash
npm run dev
```

## Project Structure

src/
├── components/ # Reusable UI components
│ ├── DeployForm.jsx
│ ├── DeploymentCard.jsx
│ ├── EmptyState.jsx
│ ├── ErrorAlert.jsx
│ ├── RepoList.jsx
│ ├── RepoSearchBar.jsx
│ ├── SkeletonCard.jsx
│ ├── Spinner.jsx
│ ├── StatusBadge.jsx
│ └── SuccessToast.jsx
├── config/
│ └── supabase.js # Supabase client
├── hooks/ # Custom React hooks
│ ├── useDeploy.js
│ ├── useGitHub.js
│ ├── useHistory.js
│ ├── usePageTitle.js
│ └── useProjects.js
├── pages/ # Route pages
│ ├── Dashboard.jsx
│ ├── Deploy.jsx
│ ├── History.jsx
│ └── NotFound.jsx
└── services/ # API service layer
├── api.js
├── deployService.js
├── deploymentsService.js
├── githubService.js
├── historyService.js
└── projectsService.js


## Environment Variables

See `.env.example` for all required variables.
