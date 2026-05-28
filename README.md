# CineSphere

> An advanced social network for cinephiles — build your film diary, share reviews, follow friends, and explore a unified social feed. Think Letterboxd meets Instagram, built on ASP.NET Core.

## 🏗️ Architecture

```
CineSphere.Api          — Controllers, DI wiring, JWT auth
CineSphere.Application  — CQRS commands/queries (MediatR), DTOs, interfaces
CineSphere.Domain      — Entities, enums (clean domain model, no framework deps)
CineSphere.Infrastructure — EF Core DbContext, TMDB API service
```

## 🔧 Tech Stack

- **ASP.NET Core 8** — Minimal API with controllers
- **Clean Architecture** — Domain / Application / Infrastructure layers
- **CQRS + MediatR** — Every read/write is a command or query handler
- **Entity Framework Core** — PostgreSQL via Npgsql, TPH inheritance on Post entity
- **Identity** — JWT Bearer auth with full user management
- **TMDB API** — Movie metadata, posters, search

## 📁 Domain Entities

| Entity | Description |
|---|---|
| `ApplicationUser` | Extends `IdentityUser` — DisplayName, Bio, AvatarUrl, navigation props |
| `Post` (abstract) | Base: `UserId`, `CreatedAt`, `Content`, `IsSpoiler`, `CommentCount`, `ReactionCount` |
| `MovieLogPost` | Inherits `Post` + `TmdbMovieId`, `Rating`, `WatchedDate`, `IsRewatch` |
| `StatusPost` | Inherits `Post` — general status/activity updates |
| `ListPost` | Inherits `Post` + FK to `CustomList` |
| `CustomList` | User-curated film lists |
| `Comment` | Threaded comments with `PostId`, `UserId`, `Text`, `CreatedAt` |
| `Reaction` | `PostId`, `UserId`, `ReactionType` (`Like`, `Popcorn`, `MindBlown`) — unique per user/post |
| `UserFollow` | Many-to-many self-referencing join for followers/following |

## 🔌 API Endpoints

### Feed
- `GET /api/feed?page=1&pageSize=20` — Social feed (posts from self + followed users, ordered by newest)

### Posts
- `GET /api/posts/{id}` — Single post with TMDB movie data
- `POST /api/posts/movie-log` — Log a watched movie
- `POST /api/posts/status` — Post a status update
- `POST /api/posts/list` — Share a list to the feed

### Movies
- `GET /api/movies/search?query=...&page=1` — Search TMDB for movies

### Reactions
- `POST /api/reactions/toggle` — Toggle reaction (same type = remove, diff type = update, none = add)

### Comments
- `POST /api/comments` — Add a comment (increments `CommentCount`)

### Follows
- `POST /api/follows` — Toggle follow/unfollow

### Lists
- `POST /api/lists` — Create a custom film list

## 🗄️ Database Design

- **TPH Inheritance** — All 3 `Post` subtypes live in a single `Posts` table with a `PostType` discriminator column
- **Reactions** have a unique composite index on `(PostId, UserId)` — prevents duplicate reactions
- **UserFollows** uses composite PK `(FollowerId, FolloweeId)` for the many-to-many self-referencing relationship

## 🚀 Getting Started

### 1. Clone & configure

```bash
git clone https://github.com/iamsammy-ak/CineSphere.git
cd CineSphere
```

### 2. Add secrets to `src/CineSphere.Api/appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=cinesphere;Username=postgres;Password=YOUR_PASSWORD"
  },
  "Tmdb": {
    "ApiKey": "YOUR_TMDB_API_KEY"
  }
}
```

Get a TMDB API key at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

### 3. Run migrations

```bash
dotnet ef migrations add InitialCreate --project src/CineSphere.Infrastructure --startup-project src/CineSphere.Api
dotnet ef database update --project src/CineSphere.Infrastructure --startup-project src/CineSphere.Api
```

### 4. Run

```bash
dotnet run --project src/CineSphere.Api
```

Swagger UI: `http://localhost:5000/swagger`

## 📡 Social Feed Query Flow

```
GET /api/feed
  └─ GetSocialFeedQueryHandler
       ├─ 1. Query UserFollows → get FolloweeIds
       ├─ 2. Include current user + followed users' Posts
       ├─ 3. Order by CreatedAt DESC, paginate
       ├─ 4. For MovieLogPosts → inject TMDB poster/metadata via ITmdbService
       └─ 5. Return SocialFeedResponse<PostDto[]>
```

## 🔐 Auth Flow

- JWT Bearer tokens via `AddIdentityApiEndpoints<ApplicationUser>()`
- `ICurrentUserService` extracts `User.FindFirst(ClaimTypes.NameIdentifier)?.Value` from `HttpContext`
- All `[Authorize]` endpoints automatically validate the JWT

## 📝 Commit History

| # | Commit | Description |
|---|---|---|
| 1 | `feat(Domain)` | Domain entities — ApplicationUser, Post hierarchy, Comment, Reaction, UserFollow |
| 2 | `feat(CQRS+EF)` | EF Core DbContext (TPH), CQRS Social Feed handler, TmdbService, FeedController |
| 3 | `feat(Commands)` | CQRS Commands, API Controllers, Program.cs wiring |
| 4 | `fix(core)` | Corrected DbContext, handlers, PostId types, navigation loading |
| 5 | `fix(controllers)` | Rewrote all API controllers with proper DTOs and [Authorize] |
| 6 | `fix(movies)` | TMDB search, MovieLogPost enrichment, AddListPost, CreateCustomList |
| 7 | `feat(search)` | MoviesController, ListsController, SearchMovies query |
| 8 | `fix(search)` | Corrected ITmdbService interface, TmdbService, SearchMoviesQuery |
| 9 | `docs(README)` | Full documentation, architecture overview, API reference |
