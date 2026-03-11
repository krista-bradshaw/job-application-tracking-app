# Job application tracker

A personal tool for tracking job applications. Built with React + TypeScript on the frontend and Express + SQLite on the backend.

## Project Structure

This is an npm workspaces monorepo:

```
├── frontend/    # React + Vite app (TypeScript, MUI)
├── backend/     # Express REST API + SQLite database
└── package.json # Workspace root
```

## Getting Started

> ⚠️ **All commands must be run from the project root**, not from inside `frontend/` or `backend/`.

**1. Install dependencies** (from the root — installs everything):
```bash
npm install
```

**2. Set up environment variables:**
```bash
# Frontend
cp frontend/.env.example frontend/.env

# Backend (required — server won't start without JWT_SECRET)
cp backend/.env.example backend/.env
# Then open backend/.env and fill in JWT_SECRET
```

Generate a strong JWT secret with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**3. Start the backend:**
```bash
npm run start:backend
```

**4. Start the frontend** (in a separate terminal):
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

All run from the project root:

| Command | Description |
|---|---|
| `npm run dev` | Start the frontend dev server |
| `npm run start:backend` | Start the Express API server |
| `npm run lint` | Lint the frontend |

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite, MUI |
| Backend | Node.js, Express 5 |
| Database | SQLite (via sqlite3) |
| Auth | JWT (jsonwebtoken) + bcrypt |
