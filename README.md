# Client Management App

A full-stack reference application built with **Spring Boot 3** (Java 21) and **Angular 17** for managing clients.  
It demonstrates JWT authentication, role-based authorization, CRUD, search, import/export, drafts, global error handling, cookie management, and strong unit-test coverage targets on both tiers.

> This project implements the assignment requirements (clients table & detail view, CRUD, search, robust error handling, `RABO_CLIENTS` cookie, Angular **Signals** + **standalone components** + **new control-flow blocks**, optional import/export, drafts, tests, and documentation).

---

## Table of contents

- [Architecture overview](#architecture-overview)
- [Repo layout](#repo-layout)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Data seeding](#data-seeding)
- [Authentication & roles](#authentication--roles)
- [Key features](#key-features)
- [API](#api)
- [Frontend details](#frontend-details)
- [Testing & coverage](#testing--coverage)
- [Dev tooling](#dev-tooling)
- [Deployment](#deployment)
- [Design decisions](#design-decisions)
- [Challenges](#challenges)
- [Future improvements / Roadmap](#future-improvements--roadmap)
- [Troubleshooting](#troubleshooting)

---

## Architecture overview

```
┌──────────────────────────────┐        HTTP JSON        ┌──────────────────────────────┐
│          Angular 17          │  ───────────────────▶   │        Spring Boot 3         │
│  • Standalone components     │   ◀──────────────────   │  • REST controllers (/api)   │
│  • Signals & new control     │                          │  • JWT auth (stateless)      │
│    flow blocks (@if/@else)   │                          │  • JPA + H2 (dev)            │
│  • Angular Material (MDC)    │                          │  • Global error handler      │
│  • XLSX import/export        │                          │  • Method security (@PreAuth)│
└──────────────────────────────┘                          └──────────────────────────────┘
                                                           │
                                                           ▼
                                                     In-memory H2 DB
```

- Stateless **JWT** issued by `/api/auth/login`, attached by an Angular **HTTP interceptor**.
- Route **guard** + server-side **@PreAuthorize** for defense in depth.
- Backend sets a **`RABO_CLIENTS`** cookie (total client count, 1-day expiry) on selected endpoints, readable by the SPA.

---

## Repo layout

```
client-management-app/
├─ backend/        Spring Boot service (Java 21)
└─ frontend/       Angular 17 app
```

- This root README covers both projects.

## Tech stack

**Backend**

- Java 21, Spring Boot 3.x (Web, Validation, Data JPA, Security, Actuator)
- H2 (in-memory) for local dev
- JWT (jjwt 0.11.x)
- JaCoCo coverage enforcement (≥80% line coverage target)

**Frontend**

- Angular 17 (standalone components, Signals, new control-flow)
- Angular Material (MDC)
- RxJS
- `xlsx` for import/export
- Karma/Jasmine unit tests

---

## Quick start

### Prerequisites

- **Java 21**, **Maven 3.9+**
- **Node 18+**, **npm** (or pnpm/yarn)

### 1) Run the backend

```bash
cd backend
mvn spring-boot:run
```

- API: http://localhost:8080
- (If enabled) H2 console for inspection at `/h2-console`.

### 2) Run the frontend (dev)

```bash
cd ../frontend
npm ci
npm start   # ng serve with proxy
```

- SPA: http://localhost:4200
- Dev server proxies `/api` → `http://localhost:8080` (see `frontend/proxy.conf.json`).

---

## Data seeding

On first start the backend seeds:

- **Clients** from `backend/src/main/resources/clients.json`
- **Users** from `backend/src/main/resources/users.json` with roles: `VIEWER`, `EDITOR`, `ADMIN`

Seeders are **idempotent** (skip when data already exists) and log what was inserted.

---

## Authentication & roles

- **Login**: `POST /api/auth/login` with `{ email }`  
  Returns `{ token, user }`. The token is stored in `localStorage` and attached on each request by the `authInterceptor`.

**Roles**

- `VIEWER`: read-only
- `EDITOR`: CRUD on clients & drafts, import/export
- `ADMIN`: everything, plus `/dashboard`

**UX behavior**

- Header menu adapts to the current role.
- Guarded routes use the **auth guard** with `data.roles`.  
  If a logged-in user lacks permission (e.g., viewer visiting `/dashboard`), a friendly snackbar appears and the app redirects to `/clients`.
- Global **error interceptor**:
  - `401` → “Session expired/invalid” snackbar + redirect to `/login`.
  - `403` → “Not authorized” snackbar + redirect to `/clients`.

---

## Key features

- ✅ Clients table (sortable, filterable; responsive; dark-mode friendly)
- ✅ Client detail dialog (clickable rows)
- ✅ Create / Update / Delete
- ✅ Search
- ✅ Drafts (save temporary client data you can finish later)
- ✅ Import (Excel/CSV) & Export (Excel/CSV) via `xlsx`
- ✅ `RABO_CLIENTS` cookie with total count (1-day expiry)
- ✅ Angular **Signals** for state (loading, lists, counts, filters, pagination)
- ✅ **Standalone** components & **new control-flow** (`@if`, `@else`)
- ✅ Role-based navigation unristrictions for Admin

---

## API

### Auth

```
POST /api/auth/login
Body: { "email": "alice@example.com" }
→ 200 OK
{
  "token": "<jwt>",
  "user": { "id": 1, "email": "...", "fullName": "...", "role": "ADMIN|EDITOR|VIEWER", "active": true }
}
```

### Clients

```
GET    /api/clients                 → [ClientDto] (sets RABO_CLIENTS cookie)
GET    /api/clients/{id}            → ClientDto   (sets cookie)
GET    /api/clients/search?keyword= → [ClientDto] (sets cookie)

POST   /api/clients                 → ClientDto   (ADMIN/EDITOR)
PUT    /api/clients/{id}            → ClientDto   (ADMIN/EDITOR)
DELETE /api/clients/{id}            → 204         (ADMIN/EDITOR)  # hard delete (see roadmap for soft delete)
GET    /api/clients/count           → long        (sets cookie)

POST   /api/clients/bulk            → [ClientDto] (ADMIN/EDITOR)  # import helper
```

### Drafts _(ADMIN/EDITOR)_

```
GET    /api/drafts
GET    /api/drafts/{id}
POST   /api/drafts
PUT    /api/drafts/{id}
DELETE /api/drafts/{id}
```

### Audit Logs _(ADMIN/EDITOR)_

```
GET    /api/logs                    → [AuditLogDto]
```

**Errors** are returned as structured JSON by the global exception handler (validation errors, not found, forbidden, generic).

---

## Frontend details

**Routing**

- `/login` (public)
- `/clients` (all roles)
- `/drafts` (ADMIN/EDITOR)
- `/logs` (ADMIN/EDITOR)
- `/dashboard` (ADMIN)

**Guards**  
Auth guard validates login and, when `data.roles` is present, restricts by role.  
On denial: snackbar + redirect to `/clients` (not a logout).

**Theming**  
Light/dark supported via Angular Material. Row hover/readability is tuned for dark backgrounds.

**Import/Export**  
Implemented via `xlsx` utils. Import (bulk) posts to `/api/clients/bulk`.

---

## Testing & coverage

### Backend (JUnit + JaCoCo)

```bash
cd backend
mvn verify
```

- Generates JaCoCo HTML at `backend/target/site/jacoco/index.html`.
- Build **fails** if bundle **line coverage < 80%** (see `jacoco-maven-plugin` rule in `pom.xml`).

### Frontend (Karma/Jasmine)

```bash
cd frontend
npm test
```

- Coverage report under from Jasmine.

---

## Dev tooling

- **Actuator** for health/metrics.
- **Proxy** `frontend/proxy.conf.json` → `/api` to `http://localhost:8080` during `ng serve`.
- **Material theming** configured in `frontend/src/styles.scss`.
- **Scripts** (`frontend/package.json`):
  - `npm start` → dev server with proxy
  - `npm test` → unit tests
  - `npm run build` → production build

---

## Deployment

**Backend**

```bash
cd backend
mvn clean package
# produces a runnable jar under target/
```

Run behind a reverse proxy or containerize with a simple Dockerfile.

**Frontend**

```bash
cd frontend
npm run build
# deploy contents of dist/frontend/ behind a web server
# reverse proxy /api → Spring Boot service
```

**Configuration**

- JWT keys & TTL via properties:
  - `security.jwt.secret` (32+ chars or Base64)
  - `security.jwt.expiration-ms` (e.g., 86400000 for 1 day)
- CORS allows `http://localhost:4200` in dev.

---

## Design decisions

- **Stateless JWT** simplifies scaling and aligns with SPA architecture.
- **Role enforcement** both server-side (**@PreAuthorize**) and client-side (guard) for defense-in-depth.
- `RABO_CLIENTS` cookie is set server-side (non-HttpOnly) to meet the requirement and be readable by the SPA.
- **Seeders** make the app demo-ready; idempotence protects existing data.
- **Signals & standalone components** embrace modern Angular.

---

## Challenges

- **Deterministic tests** around file parsing (XLSX + FileReader).  
  _Solution:_ stub `FileReader` and spy on `XLSX.utils` safely in specs.
- **JaCoCo threshold** (80% line) while keeping tests meaningful.  
  _Solution:_ focused unit tests on controllers/services + Angular component/service specs.
- **Time constraints:** Delivered a working solution within a short window; prioritized core scope, tests, and documentation over non-critical polish.

## Future improvements / Roadmap

- **Backend pagination & sorting** on `GET /api/clients` and `/search`:

  - Parameters: `page`, `size`, `sort` (e.g., `sort=fullName,asc`)
  - Response: Spring `Page` style payload (`content`, `totalElements`, `totalPages`, …), jwt Use HttpOnly plan.

- **Soft delete** for clients/drafts:
  - Add `deletedAt` or `active` flag; `DELETE` marks soft-deleted; `GET` filters them out by default.
  - Admin endpoint to list/restore soft-deleted items.
- **OpenAPI/Swagger** docs via `springdoc-openapi` for live API documentation.
- **E2E tests** (Cypress) covering auth, CRUD, drafts, and import/export.
- **Export streaming** endpoints for large datasets.
- **OIDC provider** (Keycloak/Okta/Auth0) instead of demo email-only login.
- **Server-side validation messages i18n** and consistent client display.

---

## Troubleshooting

- **401 everywhere** → token missing/expired: log in again. Interceptor will redirect.
- **403 on pages** → role not permitted: guard shows a snackbar and redirects to `/clients`.
- **CORS issues** → ensure dev origin `http://localhost:4200` is allowed (it is in `SecurityConfig`).
- **Proxy not applied** → use `npm start` (which loads `proxy.conf.json`) during local dev.
- **H2 empty** → seeding runs only on an empty DB; delete the file DB (if configured) or restart with a clean in-memory DB.

---

### Appendix: project metadata

- **Backend build**: Maven (`backend/pom.xml`) with `jacoco-maven-plugin` enforcing min 0.80 line coverage.
- **Frontend build**: Angular CLI (`frontend/angular.json`) with dev/prod configs; tests via Karma/Jasmine.

---
