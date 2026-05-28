# CineSphere

> **Cinematic social network for cinephiles** — Log movies, write reviews, follow filmmakers, like & comment on posts. Think Letterboxd meets Instagram, built with ASP.NET Core + Next.js.


![CineSphere Banner](https://img.shields.io/badge/.NET-8.0-512BD4?logo=.net) ![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql) ![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 Features

| Feature | Description |
|---|---|
| 🎬 **Film Logging** | Log any movie from TMDB with a 10-star rating + optional short review |
| ✍️ **Reviews** | Mark reviews as spoilers — blurred until revealed |
| 📰 **Social Feed** | Unified feed with MovieLogs, StatusPosts, and ListPosts |
| ❤️ **Reactions** | React with ❤️ Like, 🍿 Popcorn, 🧠 MindBlown |
| 💬 **Comments** | Inline threaded comments on every post |
| 👥 **Follow System** | Follow/unfollow users, see followers & following lists |
| 🔍 **TMDB Search** | Search the world's largest film database with poster art |
| 📋 **Custom Lists** | Curate personal film lists and share them to your feed |
| 🌙 **Dark UI** | Letterboxd-inspired dark cinematic theme |
| 🔐 **JWT Auth** | Secure register/login with 7-day JWT tokens |
| 🐳 **Docker** | One-command `docker-compose up` for full stack |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                    CineSphere.Web                    │
│     Next.js 15 · React Query · Zustand · Tailwind   │
├──────────────────────────────────────────────────────┤
│                    CineSphere.Api                   │
│  ASP.NET Core 8 · JWT Auth · Controllers · Swagger   │
├──────────────────────────────────────────────────────┤
│                 CineSphere.Application              │
│  CQRS + MediatR · DTOs · Interfaces · Clean Domain  │
├──────────────────────────────────────────────────────┤
│                 CineSphere.Infrastructure           │
│    EF Core · PostgreSQL (TPH) · TMDB API Service    │
├──────────────────────────────────────────────────────┤
│                    CineSphere.Domain                │
│           Entities · Enums · Domain Events         │
└──────────────────────────────────────────────────────┘
```

### Database Design (Postgres + EF Core TPH)

All 3 `Post` subtypes live in a single **Posts** table via Table-Per-Hierarchy (TPH) inheritance with a discriminator column `PostType`.

---

## 🚀 Quick Start

### 1. Clone

```bash
git clone https://github.com/iamsammy-ak/CineSphere.git
cd CineSphere
```

### 2. Docker (Recommended)

```bash
# Get your TMDB API key from https://www.themoviedb.org/settings/api
export TMDB_API_KEY="your_tmdb_api_key"

docker-compose up --build
# API  → http://localhost:5001/swagger
# Web  → http://localhost:3000
```

### 3. Manual Run

```bash
# Backend
cd src/CineSphere.Api
dotnet ef migrations add InitialCreate \
  --project ../CineSphere.Infrastructure \
  --startup-project .
dotnet run


# Frontend
cd src/cinesphere-web
npm install
npm run dev
```

### 4. Get TMDB API Key

Sign up at [themoviedb.org](https://www.themoviedb.org/settings/api) — free. Add to `appsettings.json` or environment:

```json
{ "Tmdb": { "ApiKey": "YOUR_KEY" } }
```


---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register with email + password |
| POST | `/api/auth/login` | Login → returns JWT |

### Feed
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/feed` | Social feed — paginated, all post types |
| GET | `/api/posts/{id}` | Single post with TMDB data |

### Posts
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/posts/movie-log` | Log a watched film (rating + review) |
| POST | `/api/posts/status` | Post a status update |
| POST | `/api/posts/list` | Share a list to the feed |

### Movies
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/movies/search?query=...` | Search TMDB |

### Reactions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/reactions/toggle` | Toggle reaction (toggle off, swap type, or add) |

### Comments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/comments` | Add comment to a post |

### Follows
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/follows` | Toggle follow/unfollow |
| GET | `/api/follows/{userId}/follow-status` | Get follow stats |


### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/{id}` | Get user profile |
| GET | `/api/users/{id}/posts` | User's posts |
| GET | `/api/users/{id}/followers` | Followers list |
| GET | `/api/users/{id}/following` | Following list |

---

## 🧪 E2E Tests (Playwright)

```bash
cd src/cinesphere-web
npx playwright install chromium
npx playwright test
```


Tests cover: register → login → search → log movie → status post → react → comment → logout

---

## 📁 Project Structure

```
CineSphere/
├── src/
│   ├── CineSphere.Domain/          Entities: User, Post hierarchy, Comment, Reaction, UserFollow
│   ├── CineSphere.Application/    CQRS: Queries + Commands, MediatR handlers, DTOs, Interfaces
│   ├── CineSphere.Infrastructure/  EF Core DbContext, TMDB Service, Configurations
│   ├── CineSphere.Api/            Controllers, Program.cs, JWT Auth, Swagger
│   └── cinesphere-web/             Next.js 15 React App
│       ├── src/app/                Pages: /(main)/feed, search, profile, login, register
│       ├── src/components/         Feed (PostCard, CreatePostModal), Layout (Navbar)
│       ├── src/lib/                API client, Zustand store, TypeScript types
│       └── tests/                  Playwright E2E tests
├── docker-compose.yml             Postgres + API + Web in one command
└── README.md
```


---

## 🎨 UI Theme

Inspired by Letterboxd's cinematic aesthetic:

- **Background:** `#0d1117` deep dark
- **Surface:** `#161b22`
- **Primary/Gold:** `#f5c518`
- **Accent/Red:** `#e50914`
- **Text:** `#e6edf3`
- **Muted:** `#8b949e`
- **Bebas Neue** display font for headings

---

## 📝 Commit History

| # | Feature |
|---|---|
| 1 | Domain entities (ApplicationUser, Post, Comment, Reaction, UserFollow) |
| 2 | EF Core DbContext (TPH inheritance), CQRS Social Feed handler, FeedController |
| 3 | CQRS Commands (CreateMovieLog, CreateStatus, ToggleReaction, AddComment, FollowUser) |
| 4 | Fixed handlers, DbContext, navigation loading, PostId types |
| 5 | Rewrote API controllers with `[Authorize]`, DTOs |
| 6 | TMDB search, MovieLogPost enrichment, CreateCustomList |
| 7 | MoviesController, ListsController |
| 8 | Corrected ITmdbService interface, SearchMoviesQuery |
| 9 | Added auth (JWT), UsersController, FollowsController, Program.cs DI |
| 10 | Playwright E2E tests |
| 11 | **Frontend** — Next.js 15 full web app: auth, feed, search, post modal, profile |
| 12 | Docker Compose + Dockerfiles |
