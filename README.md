# Task Management Web App

A full-stack task management application with user authentication, task lists, Kanban-style boards, profiles, and comments. The **backend** is a Node.js/Express API with SQLite; the **frontend** is a React + Vite SPA.

---

## Table of Contents

- [Requirements](#requirements)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Run The Website](#run-the-website)
- [Usage Guidelines](#usage-guidelines)
- [Available Scripts](#available-scripts)
- [Team Collaboration](#team-collaboration)
- [README Helper Links](#readme-helper-links)
- [Notes](#notes)

---

## Requirements

### Functional

| Area | Description |
|------|-------------|
| **Authentication** | Register, log in, and log out with JWT-based sessions. |
| **Tasks** | Create, read, update, and delete tasks with title, description, status, priority, due date, and optional list assignment. |
| **Task status** | Three workflow states: `todo`, `in_progress`, `done` (Kanban columns and drag-and-drop). |
| **Task priority** | `low`, `medium`, or `high`. |
| **Filtering** | Search and filter tasks by status and priority on the dashboard. |
| **Lists** | Organize tasks into named lists. |
| **Profile** | View and update user profile information. |
| **Comments** | Add comments on tasks (API supported). |

### Technical

| Layer | Stack |
|-------|--------|
| **Backend** | Node.js, Express 5, SQLite (`better-sqlite3`), JWT, bcrypt, Helmet, CORS |
| **Frontend** | React 19, Vite, React Router, Axios, Formik, Yup, Bootstrap, Framer Motion |
| **Database** | SQLite file at `backend/db/task_manager.sqlite` (auto-created on first run) |
| **API base** | `http://localhost:5000/api` (configurable via env) |
| **Frontend dev** | `http://localhost:5173` |

### Non-functional

- Environment-based configuration (`.env` files; never commit secrets).
- Protected routes on the frontend; authenticated API routes on the backend.
- Health check endpoint: `GET /api/health`.

---

## Prerequisites

- **Node.js** 18+ and **npm**
- **Git** (for cloning and team workflow)
- On Windows, if PowerShell blocks `npm`, use `npm.cmd` as shown in [Run The Website](#run-the-website).

---

## Project Structure

```
.
├── backend/          # Express API, SQLite, JWT auth
├── frontend/         # React + Vite UI
├── package.json      # Root scripts (test, lint, start backend)
└── team-push-assignments/   # Optional per-person work packages (see below)
```

---

## Installation

Install dependencies from the repository root:

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

Copy environment templates if you do not already have `.env` files:

```bash
# Backend

copy backend\.env.example backend\.env   # Windows

# Frontend
copy frontend\.env.example frontend\.env
```

Edit `backend/.env` and `frontend/.env` (see [Environment Variables](#environment-variables)).

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Example | Purpose |
|----------|---------|---------|
| `PORT` | `5000` | API server port |
| `NODE_ENV` | `development` | Runtime mode |
| `DATABASE_FILE` | `./db/task_manager.sqlite` | SQLite database path |
| `JWT_SECRET` | *(change in production)* | Token signing secret |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |

### Frontend (`frontend/.env`)

| Variable | Example | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | `http://localhost:5000/api` | Backend API base URL |

---

## Run The Website

1. Install dependencies:
   - `npm install`
   - `npm --prefix backend install`
   - `npm --prefix frontend install`

2. Make sure env files exist:
   - `backend/.env`
   - `frontend/.env`

3. Start backend:
   - `npm.cmd --prefix backend run dev`

4. Start frontend (new terminal):
   - `npm.cmd --prefix frontend run dev`

5. Open:
   - `http://localhost:5173`

---

## Usage Guidelines

### For users

1. Open the app in your browser (`http://localhost:5173`).
2. **Register** a new account or **log in** with existing credentials.
3. On the **Dashboard**, create tasks, assign lists, set priority and status, and use Kanban drag-and-drop between columns.
4. Use **filters** (search, status, priority) to narrow the task list.
5. Open **Profile** to update your account details.
6. **Log out** when finished on a shared machine.

### For developers

- API routes are mounted under `/api` (`auth`, `tasks`, `lists`, `profile`, `comments`).
- After changing backend code, nodemon restarts the server automatically in `dev` mode.
- Frontend hot-reloads via Vite during `npm --prefix frontend run dev`.
- Run backend tests from the root: `npm test` (or `npm --prefix backend run test`).
- Run linters: `npm run lint` (backend) and `npm --prefix frontend run lint`.
- Production build for the UI: `npm --prefix frontend run build` → output in `frontend/dist/`.

---

## Available Scripts

| Location | Command | Description |
|----------|---------|-------------|
| Root | `npm test` | Run backend Jest tests |
| Root | `npm start` | Start backend (production) |
| Root | `npm run lint` | ESLint on backend |
| `backend/` | `npm run dev` | API with nodemon |
| `frontend/` | `npm run dev` | Vite dev server |
| `frontend/` | `npm run build` | Production build |
| `frontend/` | `npm run preview` | Preview production build |

---

## Team Collaboration

If your course uses split assignments, see [`team-push-assignments/README.md`](team-push-assignments/README.md). Each teammate works in their `person-*` folder, then copies changes back to `backend/`, `frontend/`, and the repo root before committing.

**Do not commit:** `node_modules/`, `.env` files, or generated `frontend/dist/` (reinstall and rebuild locally).

---

## README Helper Links

- **README syntax & best practices:** [How to Write a README File](https://www.mygreatlearning.com/blog/readme-file/)
- **Online Markdown editor:** [StackEdit](https://stackedit.io/app#)

---

## Notes

- Database is SQLite and auto-created at `backend/db/task_manager.sqlite`.
- If PowerShell blocks `npm`, use `npm.cmd` commands as shown above.
