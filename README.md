# Job Application Tracker

A personal tool for tracking job applications. Built with Google Antigravity - just for fun!

## Project Structure

npm workspaces monorepo:

```
├── frontend/    # React + Vite app (TypeScript, MUI)
├── backend/     # Express REST API + SQLite database (TypeScript)
└── package.json # Workspace root
```

## Getting Started

**1. Install dependencies:**
```bash
npm install
```

**2. Set up environment variables:**
```bash
# Frontend
cp frontend/.env.example frontend/.env

# Backend (required — server won't start without JWT_SECRET)
cp backend/.env.example backend/.env
```

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**3. Start the backend** (Terminal 1):
```bash
npm run start:backend
```

**4. Start the frontend** (Terminal 2):
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

All run from the project root:

| Command | Description |
|---|---|
| `npm run dev` | Start the frontend dev server |
| `npm run start:backend` | Start the Express API server |
| `npm test` | Run all tests (frontend + backend) |
| `npm run test:watch` | Run frontend tests in watch mode |
| `npm run lint` | Lint the frontend |

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite, MUI |
| Backend | Node.js, Express 5, TypeScript (tsx) |
| Database | SQLite |
| Auth | JWT + bcrypt |
| Testing | Vitest, Testing Library |
