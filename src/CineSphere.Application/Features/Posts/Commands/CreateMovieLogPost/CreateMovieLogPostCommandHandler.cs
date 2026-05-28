using CineSphere.Application.Common.Interfaces;
using CineSphere.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Features.Posts.Commands.CreateMovieLogPost;

public record CreateMovieLogPostCommand(
    string UserId,
    int TmdbMovieId,
    decimal Rating,
    DateTime WatchedDate,
    bool IsRewatch,
    string? Content,
    bool IsSpoiler
) : IRequest<MovieLogPostDto>;

public class CreateMovieLogPostCommandHandler : IRequestHandler<CreateMovieLogPostCommand, MovieLogPostDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ITmdbService _tmdbService;

    public CreateMovieLogPostCommandHandler(IApplicationDbContext context, ITmdbService tmdbService)
    {
        _context = context;
        _tmdbService = tmdbService;
    }

    public async Task<MovieLogPostDto> Handle(CreateMovieLogPostCommand request, CancellationToken cancellationToken)
    {
        var post = new MovieLogPost
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            TmdbMovieId = request.TmdbMovieId,
            Rating = request.Rating,
            WatchedDate = request.WatchedDate,
            IsRewatch = request.IsRewatch,
            Content = request.Content,
            IsSpoiler = request.IsSpoiler,
            CreatedAt = DateTime.UtcNow,
            CommentCount = 0,
            ReactionCount = 0
        };

        _context.Posts.Add(post);
        await _context.SaveChangesAsync(cancellationToken);

        var user = await _context.Users.FindAsync(new object[] { request.UserId }, cancellationToken);
        var movie = await _tmdbService.GetMovieByIdAsync(request.TmdbMovieId, cancellationToken);

        return new MovieLogPostDto
        {
            Id = post.Id,
            UserId = post.UserId,
            UserDisplayName = user?.UserName ?? request.UserId,
            UserAvatarUrl = user?.AvatarUrl,
            CreatedAt = post.CreatedAt,
            Content = post.Content,
            IsSpoiler = post.IsSpoiler,
            CommentCount = post.CommentCount,
            ReactionCount = post.ReactionCount,
            PostType = "MovieLog",
            TmdbMovieId = post.TmdbMovieId,
            Rating = post.Rating,
            WatchedDate = post.WatchedDate,
            IsRewatch = post.IsRewatch,
            Movie = movie
        };
    }
}
