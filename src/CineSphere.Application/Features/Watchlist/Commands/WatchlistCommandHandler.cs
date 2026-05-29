using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Features.Watchlist.Commands;
using MediatR;
using Microsoft.EntityFrameworkCore;


namespace CineSphere.Application.Features.Watchlist.Commands;

public record AddToWatchlistCommand(string UserId, int TmdbMovieId, string Title, string? PosterPath) : IRequest<bool>;

public class AddToWatchlistCommandHandler : IRequestHandler<AddToWatchlistCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public AddToWatchlistCommandHandler(IApplicationDbContext context) { _context = context; }

    public async Task<bool> Handle(AddToWatchlistCommand request, CancellationToken ct)
    {
        var exists = await _context.WatchlistItems
            .AnyAsync(w => w.UserId == request.UserId && w.TmdbMovieId == request.TmdbMovieId, ct);
        if (exists) return false;

        _context.WatchlistItems.Add(new CineSphere.Domain.Entities.WatchlistItem
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            TmdbMovieId = request.TmdbMovieId,
            Title = request.Title,
            PosterPath = request.PosterPath,
            AddedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync(ct);
        return true;
    }
}

public record RemoveFromWatchlistCommand(string UserId, int TmdbMovieId) : IRequest<bool>;

public class RemoveFromWatchlistCommandHandler : IRequestHandler<RemoveFromWatchlistCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public RemoveFromWatchlistCommandHandler(IApplicationDbContext context) { _context = context; }

    public async Task<bool> Handle(RemoveFromWatchlistCommand request, CancellationToken ct)
    {
        var item = await _context.WatchlistItems
            .FirstOrDefaultAsync(w => w.UserId == request.UserId && w.TmdbMovieId == request.TmdbMovieId, ct);
        if (item == null) return false;

        _context.WatchlistItems.Remove(item);
        await _context.SaveChangesAsync(ct);
        return true;
    }
}

public record GetWatchlistQuery(string UserId) : IRequest<List<WatchlistItemDto>>;

public record WatchlistItemDto(Guid Id, int TmdbMovieId, string Title, string? PosterPath, DateTime AddedAt);

public class GetWatchlistQueryHandler : IRequestHandler<GetWatchlistQuery, List<WatchlistItemDto>>
{
    private readonly IApplicationDbContext _context;
    public GetWatchlistQueryHandler(IApplicationDbContext context) { _context = context; }

    public async Task<List<WatchlistItemDto>> Handle(GetWatchlistQuery request, CancellationToken ct)
    {
        var items = await _context.WatchlistItems
            .Where(w => w.UserId == request.UserId)
            .OrderByDescending(w => w.AddedAt)
            .ToListAsync(ct);

        return items.Select(w => new WatchlistItemDto(w.Id, w.TmdbMovieId, w.Title, w.PosterPath, w.AddedAt)).ToList();
    }
}
