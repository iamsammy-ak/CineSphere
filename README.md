# CineSphere

> **Cinematic social network for cinephiles** — Log movies, write reviews, follow filmmakers, react to posts. Think Letterboxd meets Instagram.

[![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?logo=.net)](https://dotnet.microsoft.com/) [![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?logo=next.js)](https://nextjs.org/) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://postgresql.org/) ![Tested](https://img.shields.io/badge/Tests-8%20E2E%20scenarios-39ff14)

---

## ⚡ Features

| | |
|---|---|
| 🎬 **Film Logging** | Search TMDB → log with 10-star rating + optional review |
| ✍️ **Spoiler Reviews** | Mark reviews as spoiler — blurred until clicked |
| 📰 **Unified Social Feed** | All post types (MovieLogs, Status Posts, List Shares) sorted by newest |
| ❤️ **Reactions** | ❤️ Like · 🍿 Popcorn · 🧠 MindBlown — 3-way toggle |
| 💬 **Inline Comments** | Comment directly on any post — counter updates live |
| 👥 **Follow System** | Follow/unfollow — your feed shows only people you follow |
| 🔍 **TMDB Search** | Full-text film search with poster art and vote counts |
| 📋 **Custom Lists** | Create lists, share them as posts |
| 🌙 **Dark UI** | Letterboxd-inspired cinematic dark theme |
| 🔐 **JWT Auth** | Secure registration + login — 7-day tokens |
| 🐳 **Docker** | `docker-compose up` → full stack in one command |
| 🧪 **E2E Tests** | 8 Playwright scenarios: register → login → log → react → comment → logout |


---

## 🏗️ Architecture

```
CineSphere.Api              ASP.NET Core 8 — JWT Auth, Controllers, Swagger
CineSphere.Application      CQRS + MediatR — every read/write is a handler
CineSphere.Infrastructure  EF Core + PostgreSQL (TPH inheritance), TMDB Service
CineSphere.Domain          Clean entities: User, Post hierarchy, Comment, Reaction
cinesphere-web            Next.js 15 — React Query, Zustand, Tailwind CSS
```

### Database: TPH Inheritance

All 3 `Post` subtypes (`MovieLogPost`, `StatusPost`, `ListPost`) live in one `Posts` table via **Table-Per-Hierarchy (TPH)** — a discriminant column distinguishes them. Queries are simple, no joins needed.

---

## 🚀 Getting Started

### Quickest: Docker
```bash
export TMDB_API_KEY="your_key"  # from themoviedb.org/settings/api

docker-compose up --build
# API  → http://localhost:5001/swagger
# Web  → http://localhost:3000
```

### Manual
```bash
# Backend
cd src/CineSphere.Api
dotnet ef migrations add InitialCreate --project ../CineSphere.Infrastructure
dotnet run

# Frontend
cd src/cinesphere-web
npm install && npm run dev
```

### Get TMDB API Key
Free at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api). Add to `appsettings.json`:
```json
{ "Tmdb": { "ApiKey": "YOUR_KEY" } }
```

---

## 📡 API Overview

| Method | Endpoint | What it does |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login → JWT |
| GET | `/api/feed` | Social feed (paginated) |
| POST | `/api/posts/movie-log` | Log a film + rating + review |
| POST | `/api/posts/status` | Post a status |
| GET | `/api/movies/search?query=...` | Search TMDB |
| POST | `/api/reactions/toggle` | Toggle reaction |
| POST | `/api/comments` | Add comment |
| POST | `/api/follows` | Follow/unfollow toggle |
| GET | `/api/users/{id}` | User profile + stats |
| GET | `/api/users/{id}/posts` | User's posts |

Swagger UI: `http://localhost:5001/swagger`


---

## 🎨 Dark UI Theme

| Token | Hex | Use |
|---|---|---|
| `--cs-bg` | `#0d1117` | Page background |
| `--cs-primary` | `#f5c518` | Gold — CTA buttons, stars, links |
| `--cs-accent` | `#e50914` | Alerts, spoiler toggles |
| `--cs-text` | `#e6edf3` | Primary text |
| `--cs-muted` | `#8b949e` | Secondary text, labels |
| `--cs-border` | `#30363d` | All borders on dark surfaces |

---

## 🧪 Run E2E Tests

```bash
cd src/cinesphere-web
npx playwright install chromium
npx playwright test
```

8 scenarios: register → login → navbar check → guest landing → search → log a movie → status post → react → comment → logout

---

## 📁 File Structure

```
CineSphere/
├── src/
│   ├── CineSphere.Api/            Controllers, AuthController, Program.cs, JWT
│   ├── CineSphere.Application/    CQRS handlers (MediatR), DTOs, Interfaces
│   ├── CineSphere.Domain/          Entities: User, Post×3, Comment, Reaction, UserFollow
│   ├── CineSphere.Infrastructure/  EF Core DbContext (TPH), TmdbService
│   └── cinesphere-web/
│       ├── src/app/
│       │   ├── page.tsx            Feed page + landing
│       │   ├── login/page.tsx
│       │   ├── register/page.tsx
│       │   ├── search/page.tsx      TMDB film search grid
│       │   └── profile/page.tsx     Profile + activity
│       ├── src/components/
│       │   ├── Layout/Navbar.tsx
│       │   └── Feed/PostCard.tsx + CreatePostModal.tsx
│       ├── src/lib/                 api.ts, store.ts (Zustand), types.ts, enums.ts
│       └── tests/e2e.spec.ts
├── docker-compose.yml
├── docker-compose.yml              PostgreSQL + API + Web
└── README.md
```
