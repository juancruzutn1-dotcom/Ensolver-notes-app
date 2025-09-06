# Ensolvers Notes – Full Stack Implementation (SPA)

A simple full-stack notes app with tagging and filtering.

- **Phase 1 (required):** create, edit, delete, archive/unarchive notes.  
- **Phase 2 (extra):** add/remove categories (tags) on notes and filter by category.

---

## Tech Stack

- **Backend:** NestJS 10 (Node 20) with REST API, layered Controllers/Services + Prisma ORM + SQLite  
- **Frontend:** React 18 + Vite 5 + TypeScript + React Query  
- **Database:** SQLite (`backend/prisma/dev.db`) via Prisma  

> You can swap SQLite for PostgreSQL/MySQL by updating the `datasource` in `prisma/schema.prisma` and setting the `DATABASE_URL` environment variable.

---

## Requirements

- Node.js **v20+** and npm **v10+**  
- macOS/Linux shell (bash or zsh)  
- Git (for cloning and version control)

---

## Quick Start

From the project root:

```bash
./run.sh
```

This will:

1. Install backend dependencies, generate Prisma client, apply DB migrations, and seed sample data.  
2. Start backend at `http://localhost:3000` with CORS enabled.  
3. Install frontend dependencies and start Vite dev server at `http://localhost:5173`.  
4. Proxy frontend API requests to the backend (`/api -> http://localhost:3000`).

---

## Repository Structure

```
backend/   # NestJS + Prisma REST API
frontend/  # Vite + React SPA
run.sh     # one-command setup and run
README.md
```

---

## Backend

- Layered structure with Controllers/Services and Prisma DAO module.  
- Endpoints:

```
GET    /notes?archived=bool&categoryId=int
GET    /notes/:id
POST   /notes                        { title, content?, categoryIds? }
PUT    /notes/:id                    { title?, content?, archived?, categoryIds? }
PATCH  /notes/:id/archive            { archived: bool }
PATCH  /notes/:id/categories         { categoryIds: number[] }
DELETE /notes/:id

GET    /categories
POST   /categories                   { name }
DELETE /categories/:id
```

### Running Backend Directly

```bash
cd backend
npm install
npm run prisma:dev   # migrate + seed (first time)
npm run start:dev
```

---

## Frontend

- Single-page React app featuring:  
  - Toggle to show archived / active notes  
  - Category filter (Phase 2)  
  - Create note form  
  - Per-note archive/unarchive, delete  
  - Per-note category checkboxes (Phase 2)

### Running Frontend Directly

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

## Demo Walkthrough

**Phase 1: Note Management**

1. Open the app in a browser.  
2. Create a note using the “Create note” form.  
3. Edit the note inline.  
4. Archive or unarchive the note.  
5. Delete the note.

**Phase 2: Categories / Filtering**

1. Create some categories via backend API or UI (if implemented).  
2. Add/remove categories on notes using checkboxes.  
3. Filter notes by category using the dropdown.

---

## Architecture Diagram

```
+----------------+       REST API        +-----------------+
|                | <------------------> |                 |
|   Frontend SPA |                       |    Backend API  |
|  (React + Vite)| ------------------>  |  (NestJS + Prisma)|
|                | <------------------  |                 |
+----------------+                       +-----------------+
                                            |
                                            |
                                            v
                                      +-----------------+
                                      |                 |
                                      |    Database     |
                                      |   (SQLite / DB) |
                                      |                 |
                                      +-----------------+
```

---

## Login

No login implemented. 

---

## Live Deployment

No Live Deployment implemented.

---

## Versions

- Node 22.19.0
- npm 10.9.3 
- NestJS 10.0.0
- Prisma 6.15.0
- React 18.3.1
- Vite 5.4.19  
- TypeScript 5.9.2 

---

