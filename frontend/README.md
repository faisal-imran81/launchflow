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

## AI error handling

The AI Engine never shows raw provider errors. The backend attaches a machine-readable `code` to every AI failure, and the frontend turns that code into a message a user can act on.

| Backend code | Status | Message shown |
|---|---|---|
| `ai/rate-limited` | 429 | Too many requests, wait a moment and try again |
| `ai/service-unavailable` | 503 | The AI service is temporarily unavailable |
| `ai/bad-gateway` | 502 | The AI provider returned an error |
| `ai/auth-failed` | 500 | The AI service is not available right now |
| `ai/model-unavailable` | 500 | The AI model is currently unavailable |
| `bad-request/invalid-json` | 400 | Invalid request data, check your input |

If the request never reaches the server, the message is "Cannot reach the server. Check your connection and try again."

### How it fits together

- `src/utils/aiErrorMessages.js` holds `getAiErrorMessage` (code, then status, then fallback) and `resolveAiError`, which keeps the server's own message for validation errors such as a repo without a package.json.
- `src/hooks/useAI.js` uses `resolveAiError` in every generate handler and exposes `clearError`, which dismisses the error without wiping results that are already on screen.
- `src/components/ErrorAlert.jsx` shows the message with an optional "Try again" button and a dismiss button.
- `src/components/AIEngine.jsx` remembers the last action (auto-detect, manual Dockerfile or manual workflow), so "Try again" repeats exactly what failed.

### Tests

Run from the repo root:

    node --test frontend/tests/*.test.js
