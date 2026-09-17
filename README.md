# Atria No Due Portal

Hall-ticket clearance portal for Atria Institute of Technology — a single Next.js
(App Router) application that serves both the UI and the API, deployable on Vercel.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router), React 19 |
| Database | MongoDB via Mongoose |
| Auth | JWT in an httpOnly cookie (`jose`), enforced in `middleware.js` |
| File storage | Vercel Blob (local dev falls back to `public/uploads`) |
| Styling | Tailwind CSS |

## Local development

```bash
npm install
cp .env.local.example .env.local   # if you don't already have .env.local
npm run seed                       # first run only — creates staff + student accounts
npm run dev                        # http://localhost:3001
```

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Signs the session cookie |
| `BLOB_READ_WRITE_TOKEN` | production | Vercel Blob token for document uploads |

Without `BLOB_READ_WRITE_TOKEN`, uploads in development are written to
`public/uploads/` instead so the flow stays testable. In production the token is
required.

### Seeding

```bash
npm run seed              # creates staff logins; generates students only if none exist
npm run seed -- --reset   # wipes all students + student logins, then regenerates
```

Seed accounts:

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Accounts | `account` | `account123` |
| Class Coordinator | `cc` | `cc123` |
| Faculty | `faculty` | `faculty123` |

Students log in with their USN as both username and password (e.g. `1AT23CG001`).
The generator creates 8 semesters × 8 branches × 3 sections × 5 students.

## Architecture

**Rendering.** Each dashboard is a Server Component that queries MongoDB directly
(`lib/data/students.js`) and passes the result into a `'use client'` island, so the
first paint already contains real data — no client-side fetch waterfall. Mutations
run client-side against the API routes, then call `router.refresh()` to re-run the
server fetch.

**Filtering.** Semester/branch/section filters live in the URL (`?sem=&branch=&section=`),
so the server returns only the matching students rather than the whole collection.

**Caching.** `/api/meta` (static domain constants) is cached for an hour. Everything
student-related is `force-dynamic`, and every mutation calls `revalidatePath` so the
next navigation reflects the write immediately.

**Auth.** `middleware.js` verifies the session cookie at the edge, redirects anonymous
users to `/login`, and keeps each role inside its own route segment. API routes
re-check the role server-side — the middleware is not the only gate.

### Layout

```
app/
  (dashboard)/       role dashboards (server components + loading skeletons)
  api/               route handlers — the whole REST surface
  login/             public login page
components/          shared UI; components/dashboards/* are the client islands
lib/
  data/students.js   all student business logic (shared by pages and API routes)
  db.js              cached Mongoose connection (serverless-safe)
  auth.js            JWT sign/verify (Edge-compatible)
  session.js         getServerUser() for Server Components and route handlers
models/              Mongoose schemas
scripts/seed.mjs     standalone seeder
```

## Deploying to Vercel

1. Push this folder to a Git repository and import it in Vercel (framework is
   auto-detected as Next.js).
2. Set `MONGODB_URI`, `JWT_SECRET` and `BLOB_READ_WRITE_TOKEN` in
   **Project Settings → Environment Variables**.
3. Create a Blob store under **Storage → Blob** and connect it to the project —
   this populates `BLOB_READ_WRITE_TOKEN` automatically.
4. In MongoDB Atlas, allow network access from `0.0.0.0/0` (Vercel functions have
   no fixed egress IPs).
5. Seed the production database once, locally, against the Atlas URI:
   `MONGODB_URI="<atlas-uri>" npm run seed`

Uploads are capped at 4 MB because Vercel limits serverless request bodies to
roughly 4.5 MB. Larger files would need a direct browser-to-Blob upload.
