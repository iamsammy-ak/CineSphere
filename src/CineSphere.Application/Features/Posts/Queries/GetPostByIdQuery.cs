using CineSphere.Application.Common.Models;
using CineSphere.Application.Common.Interfaces;
using CineSphere.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Features.Posts.Queries;

public record GetPostByIdQuery(Guid PostId) : IRequest<PostDto?>;

public class GetPostByIdQueryHandler : IRequestHandler<GetPostByIdQuery, PostDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly ITmdbService _tmdbService;

    public GetPostByIdQueryHandler(IApplicationDbContext context, ITmdbService tmdbService)
    {
        _context = context;
        _tmdbService = tmdbService;
    }

    public async Task<PostDto?> Handle(GetPostByIdQuery request, CancellationToken cancellationToken)
    {
        var post = await _context.Posts
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == request.PostId, cancellationToken);

        if (post == null) return null;

        var dto = new PostDto
        {
            Id = post.Id,
            UserId = post.UserId,
            UserDisplayName = post.User?.UserName ?? post.UserId,
            UserAvatarUrl = post.User?.AvatarUrl,
            CreatedAt = post.CreatedAt,
            Content = post.Content,
            IsSpoiler = post.IsSpoiler,
            CommentCount = post.CommentCount,
            ReactionCount = post.ReactionCount,
            PostType = post switch
            {
                MovieLogPost => "MovieLog",
                StatusPost => "Status",
                ListPost => "List",
                _ => "Unknown"
            }
        };

        if (post is MovieLogPost mlp)
        {
            dto.Movie = await _tmdbService.GetMovieByIdAsync(mlp.TmdbMovieId, cancellationToken);
        }

        return dto;
    }
}
