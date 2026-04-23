# FreeMentors — Frontend

React 19 + TypeScript single-page application for the FreeMentors platform, where professionals mentor young people for free.

## Tech Stack

| Tool | Version |
|------|---------|
| React | 19.x |
| TypeScript | 6.x |
| Vite | 8.x |
| Tailwind CSS | 4.x |
| Material UI (MUI) | v9 |
| Redux Toolkit | 2.x |
| React Router DOM | v7 |
| axios | latest |

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

## Setup

```bash
cd free-mentors-fn
pnpm install
```

Create a `.env` file:

```env
VITE_GRAPHQL_URL=http://localhost:8000/graphql
```

## Commands

```bash
pnpm dev            # Dev server on http://localhost:5173
pnpm build          # Type-check + production build (output: dist/)
pnpm lint           # ESLint
pnpm preview        # Serve the production build locally

pnpm test           # Run tests (Jest + React Testing Library)
pnpm test:watch     # Tests in watch mode
pnpm test:coverage  # Tests with coverage report
```

## Project Structure

```
src/
├── api/
│   ├── client.ts        # gql() helper using axios
│   ├── queries.ts       # GraphQL query strings
│   └── mutations.ts     # GraphQL mutation strings
├── components/
│   ├── Navbar.tsx           # Responsive nav with auth-aware menu
│   ├── Footer.tsx
│   └── ProtectedRoute.tsx   # Auth + role guard
├── pages/
│   ├── Landing.tsx
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Signup.tsx
│   ├── mentors/
│   │   ├── MentorsList.tsx    # Browse and filter mentors
│   │   └── MentorDetail.tsx   # Profile, request session, leave review
│   ├── dashboard/
│   │   ├── Dashboard.tsx       # Mentee — view own sessions
│   │   └── MentorDashboard.tsx # Mentor — accept / decline requests
│   └── admin/
│       └── AdminPanel.tsx      # Promote users, moderate reviews
├── store/
│   ├── index.ts
│   └── authSlice.ts     # JWT + user persisted to localStorage
├── types/
│   └── index.ts
└── __tests__/           # Jest + RTL test files
```

## Routing

| Path | Component | Access |
|------|-----------|--------|
| `/` | Landing | Public |
| `/login` | Login | Public |
| `/signup` | Signup | Public |
| `/mentors` | MentorsList | Public |
| `/mentors/:id` | MentorDetail | Public |
| `/dashboard` | Dashboard | Authenticated |
| `/mentor-dashboard` | MentorDashboard | MENTOR role |
| `/admin` | AdminPanel | ADMIN role |

## Auth Flow

1. Login/Signup POSTs a GraphQL mutation to the backend.
2. On success the server returns `{ token, user }`.
3. Both are stored in Redux (`authSlice`) and persisted to `localStorage`.
4. `ProtectedRoute` reads the token from Redux; redirects to `/login` when missing. The optional `roles` prop further restricts by user role.
5. Every API call via `gql()` passes `Authorization: Bearer <token>`.

## API Client

`src/api/client.ts` exports a single generic helper:

```ts
gql<T>(query: string, variables?: object, token?: string | null): Promise<T>
```

It wraps `axios.post` to the GraphQL endpoint and throws on GraphQL-level errors.

## Testing

Tests use **Jest** with **React Testing Library** and **jsdom**. The `gql` function is replaced with `jest.fn()` via `moduleNameMapper` so tests never hit a real server.

```bash
pnpm test                        # run all tests
pnpm test:coverage               # with coverage
```

Key test files:

| File | What it tests |
|------|--------------|
| `Login.test.tsx` | Form render, validation, gql call, Redux state, error display |
| `Signup.test.tsx` | Form fields, successful registration, error handling |
| `MentorsList.test.tsx` | List render, search/filter, loading state |
| `ProtectedRoute.test.tsx` | Redirect when unauthenticated, role guard |
| `Navbar.test.tsx` | Links, mobile menu, auth-aware rendering |
| `Landing.test.tsx` | Hero section, CTA links |

## Docker

Build the image (pass `VITE_GRAPHQL_URL=/graphql` so requests are proxied by nginx at runtime):

```bash
docker build \
  --build-arg VITE_GRAPHQL_URL=/graphql \
  -t free-mentors-fn:latest .
```

The Dockerfile is a two-stage build:
1. **builder** — `node:20-alpine`, installs pnpm, builds the Vite app.
2. **runtime** — `nginx:alpine`, serves `dist/` and proxies `/graphql` to the backend service.

See `nginx.conf` for the SPA fallback and proxy configuration.

## docker-compose

Run the full stack from the repo root:

```bash
docker compose up -d
```

The frontend container starts only after the backend passes its TCP health check. The app is then available at `http://localhost`.
