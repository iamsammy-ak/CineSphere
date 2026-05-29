using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Features.Discover.Queries;
using CineSphere.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Features.Discover.Queries;

public record GetDiscoverQuery(string? UserId) : IRequest<DiscoverDto>;

public record DiscoverDto(
    List<Application.Common.Models.TmdbMovieDto> TrendingFilms,
    List<Application.Common.Models.TmdbMovieDto> MostLoggedThisWeek,
    List<UserSummaryDto> PopularUsers,
    int TotalFilmsInDb
);

public class GetDiscoverQueryHandler : IRequestHandler<GetDiscoverQuery, DiscoverDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ITmdbService _tmdbService;
    public GetDiscoverQueryHandler(IApplicationDbContext context, ITmdbService tmdbService)
    {
        _context = context;
        _tmdbService = tmdbService;
    }

    public async Task<DiscoverDto> Handle(GetDiscoverQuery request, CancellationToken ct)
    {
        var weekAgo = DateTime.UtcNow.AddDays(-7);

        // Top 10 most logged movie IDs this week
        var topMovieIds = await _context.Posts
            .OfType<MovieLogPost>()
            .Where(p => p.CreatedAt >= weekAgo)
            .GroupBy(p => p.TmdbMovieId)
            .OrderByDescending(g => g.Count())
            .Take(10)
            .Select(g => g.Key)
            .ToListAsync(ct);

        // Fetch TMDB data for each
        var trendingTasks = topMovieIds.Select(id => _tmdbService.GetMovieByIdAsync(id, ct));
        var trending = (await Task.WhenAll(trendingTasks))
            .Where(m => m != null)
            .Cast<Application.Common.Models.TmdbMovieDto>()
            .ToList();

        // Active users this week
        var activeUserIds = await _context.Posts
            .Where(p => p.CreatedAt >= weekAgo)
            .GroupBy(p => p.UserId)
            .OrderByDescending(g => g.Count())
            .Take(10)
            .Select(g => g.Key)
            .ToListAsync(ct);

        var popularUsers = await _context.Users
            .Where(u => activeUserIds.Contains(u.Id))
            .Take(10)
            .Select(u => new UserSummaryDto(u.Id, u.DisplayName, u.AvatarUrl, false))
            .ToListAsync(ct);

        var totalFilms = await _context.Posts.OfType<MovieLogPost>().CountAsync(ct);

        return new DiscoverDto(trending, new List<Application.Common.Models.TmdbMovieDto>(), popularUsers, totalFilms);
    }
}
