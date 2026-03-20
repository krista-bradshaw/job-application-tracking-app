# Job Application Tracker

A web app for tracking job applications and interview progress — because spreadsheets just weren't cutting it anymore.

Built as a personal project using [Google Antigravity](https://antigravity.dev) for AI-assisted development. Now hosted online at **[krista-bradshaw.github.io/job-application-tracking-app](https://krista-bradshaw.github.io/job-application-tracking-app)** 🚀

## Screenshots

| Dashboard (Desktop)                                                       | Dashboard (Mobile)                                                               | Add Application                                                             |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| <img src="docs/screenshots/01_dashboard.png" width="350" alt="Dashboard"> | <img src="docs/screenshots/02_dashboard_mobile.png" width="150" alt="Dashboard"> | <img src="docs/screenshots/03_add_job.png" width="200" alt="Add Job Modal"> |

| Status Management                                                                   | Follow-up Alerts                                                                      | Authentication                                                         |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| <img src="docs/screenshots/04_status_detail.png" width="150" alt="Status Dropdown"> | <img src="docs/screenshots/05_follow_up_alert.png" width="300" alt="Follow-up Alert"> | <img src="docs/screenshots/06_login.png" width="150" alt="Login Page"> |

## Features

- **Application tracking** — add, edit, and delete job applications with role, company, level, interest, notes, URL, and application date
- **Screenshot paste** — paste or drop a job posting screenshot into the add form to auto-populate details using AI
- **Status management** — update pipeline stage (Applied → Interviewing → Offer / Rejected) (A fun graphic shows at each transition)
- **Summary stats** — live dashboard cards show total applied, interviewing, offers, and rejections at a glance
- **Follow-up alerts** — warning indicator appears on any application stuck in "Applied" for 7+ days
- **Sortable table** — click any column header to sort by company, role, status, level, interest, or date
- **Dark / light mode** — toggle between themes, persisted across sessions
- **Supabase auth** — secure per-user accounts with register, login, and logout powered by Supabase
- **Mobile Responsive** — specialized card-based layout and navigation for mobile devices

## Project Structure

npm workspaces monorepo:

```
├── frontend/    # React + Vite app (TypeScript, MUI) — deployed to GitHub Pages
├── backend/     # Legacy Express + SQLite server (no longer used in production)
└── package.json # Workspace root
```

## Getting Started (Local Development)

**1. Install dependencies:**

```bash
npm install
```

**2. Set up environment variables:**

```bash
cp frontend/.env.example frontend/.env
```

Then edit `frontend/.env` and fill in your Supabase credentials (see [Supabase Setup](#supabase-setup) below).

**3. Run the Supabase SQL schema** in your Supabase project's SQL Editor (see below).

**4. Start the frontend dev server:**

```bash
npm run dev
```

Open [http://localhost:5173/job-application-tracking-app/](http://localhost:5173/job-application-tracking-app/).

---

## Deployment (GitHub Pages)

The app is automatically deployed to GitHub Pages on every push to `main` via GitHub Actions.

---

## Mobile Use

This app is a **Progressive Web App (PWA)**, which means you can install it on your iPhone for a full-screen, native-like experience.

**Option A — Use the live site:** Visit [krista-bradshaw.github.io/job-application-tracking-app](https://krista-bradshaw.github.io/job-application-tracking-app) in Safari and tap **Share → Add to Home Screen**.

**Option B — Local development on phone:**

```bash
npm run dev:mobile --prefix frontend
```

Open Safari and go to your computer's local IP address. Make sure both devices are on the same Wi-Fi.

> [!IMPORTANT]
> Make sure to use `http://` and NOT `https://`. Safari may try to default to HTTPS, which will cause a "Secure Connection" error.

---

## Scripts

All run from the project root:

| Command              | Description                                               |
| -------------------- | --------------------------------------------------------- |
| `npm run dev`        | Start the frontend dev server (localhost only)            |
| `npm run dev:mobile` | Start the frontend dev server (accessible on local Wi-Fi) |
| `npm test`           | Run frontend tests                                        |
| `npm run test:watch` | Run frontend tests in watch mode                          |
| `npm run lint`       | Lint the frontend                                         |
| `npm run build`      | Build the frontend for production                         |

## Tech Stack

| Layer    | Tech                                  |
| -------- | ------------------------------------- |
| Frontend | React 19, TypeScript, Vite, MUI       |
| Backend  | Supabase (auth + PostgreSQL database) |
| Hosting  | GitHub Pages (frontend)               |
| Testing  | Vitest, Testing Library               |
| AI       | Gemini AI (optional)                  |
