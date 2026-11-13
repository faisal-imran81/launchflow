# Contributing to LaunchFlow

Thank you for your interest in contributing to LaunchFlow. This document outlines the guidelines for contributing to the project.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)

---

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/launchflow.git
   cd launchflow
   ```
3. Set the upstream remote:
   ```bash
   git remote add upstream https://github.com/faisal-imran81/launchflow.git
   ```
4. Install dependencies for both backend and frontend:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
5. Copy and configure environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
6. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feat/your-feature-name
   ```

---

## Project Structure

```
launchflow/
├── backend/                       # Express 5 API server
└── frontend/                      # React 19 + Vite client
```

Refer to the main [README.md](README.md) for the full project structure breakdown.

---

## Development Workflow

1. Always branch off `main`
2. Keep branches focused — one feature or fix per branch
3. Run the test suite before opening a pull request
4. Keep commits small and atomic — one logical change per commit

---

## Commit Guidelines

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>: <short description>
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, whitespace — no logic change |
| `refactor` | Code restructure with no feature or fix |
| `test` | Adding or updating tests |
| `chore` | Build process, dependency updates |
| `perf` | Performance improvements |

### Examples

```bash
git commit -m "feat: add stack auto-detection for Rust projects"
git commit -m "fix: handle SSE connection timeout gracefully"
git commit -m "docs: add JSDoc comments to deployController"
git commit -m "test: add unit tests for detectStack utility"
```

---

## Code Style

### Backend (Node.js / Express)

- Use **ESM modules** (`import`/`export`) — no CommonJS `require()`
- Use **async/await** — no raw Promise chains
- Wrap all async route handlers with `asyncHandler` utility
- Keep controllers thin — business logic belongs in services
- Add JSDoc comments to all controller and service functions

### Frontend (React)

- Use **functional components** with hooks only — no class components
- Keep components focused — one responsibility per component
- Extract reusable logic into custom hooks in `src/hooks/`
- API calls belong in `src/services/` — not directly in components or hooks

---

## Testing

### Running Tests

```bash
# From the backend directory
cd backend
npm test
```

### Test Coverage

- Unit tests live in `backend/tests/unit/`
- Integration tests live in `backend/tests/integration/`
- Test fixtures live in `backend/tests/fixtures/`

### Guidelines

- Every new utility function must have a corresponding unit test
- Every new API route must have a corresponding integration test
- All 691 existing tests must continue to pass before a PR is merged

---

## Pull Request Process

1. Ensure all tests pass locally: `npm test`
2. Update relevant documentation if your change affects behavior
3. Open a pull request against the `main` branch
4. Fill in the pull request template with a clear description of your changes
5. Reference any related issues using `Closes #issue-number`
6. Wait for review — at least one approval is required before merging

---

## Reporting Bugs

If you find a bug, please open a GitHub Issue with the following information:

- **Description** — a clear description of the bug
- **Steps to reproduce** — exact steps to reproduce the behavior
- **Expected behavior** — what you expected to happen
- **Actual behavior** — what actually happened
- **Environment** — Node.js version, OS, browser (if frontend)
- **Logs** — any relevant error messages or stack traces

---

## Questions

If you have questions about the codebase or the contribution process, open a GitHub Discussion or reach out via the repository's issue tracker.
