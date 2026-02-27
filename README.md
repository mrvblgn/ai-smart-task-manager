# AI Smart Task Manager

Full-stack task management application with authentication, task CRUD, and AI-assisted task helpers.

## Tech Stack

- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, Zod
- Frontend: React, TypeScript, Vite, Zustand, Axios, React Router

## Project Structure

```text
ai-smart-task-manager/
  backend/
  frontend/
```

## Features

- User registration and login (JWT)
- Protected routes and role middleware
- Task create, list, update, delete
- Task filtering by status and priority
- AI endpoints for description generation and task categorization
- Premium, responsive UI

## Local Development

### 1) Clone and install

```bash
git clone https://github.com/mrvblgn/ai-smart-task-manager.git
cd ai-smart-task-manager

cd backend && npm install
cd ../frontend && npm install
```

### 2) Configure backend env

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### 3) Run backend

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:5001`.

### 4) Run frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Build for Production

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## API Overview

Base URL: `http://localhost:5001/api`

- Auth
  - `POST /auth/register`
  - `POST /auth/login`
- Users
  - `GET /users/:id`
  - `GET /users?email=...`
- Tasks (protected)
  - `GET /tasks`
  - `POST /tasks`
  - `GET /tasks/:id`
  - `PATCH /tasks/:id`
  - `DELETE /tasks/:id`
- AI (protected)
  - `POST /ai/generate-description`
  - `POST /ai/categorize`

## Deployment Guide

### Option A: Render (Backend) + Vercel (Frontend)

#### Backend on Render

1. Create a new Web Service from this repo.
2. Root directory: `backend`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Set env variables:
   - `PORT` = `10000` (or Render provided port)
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRY` = `7d`
   - `CORS_ORIGIN` = your frontend domain (for example Vercel URL)

#### Frontend on Vercel

1. Create a new project from this repo.
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Before deploy, set API base URL in `frontend/src/services/api.ts` to your backend URL.

### Option B: Single VPS

1. Build backend and frontend.
2. Serve frontend `dist` behind Nginx.
3. Run backend with PM2:

```bash
cd backend
npm run build
pm2 start dist/server.js --name ai-task-backend
```

4. Configure Nginx reverse proxy:
   - `/api` -> backend process
   - `/` -> frontend static files

## Security Notes

- Never commit real `.env` credentials.
- Use strong `JWT_SECRET` in production.
- Restrict `CORS_ORIGIN` to only your deployed frontend domains.

## License

ISC
