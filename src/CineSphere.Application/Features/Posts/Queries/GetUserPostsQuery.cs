using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Common.Models;
using CineSphere.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Features.Posts.Queries;

public record GetUserPostsQuery(string UserId, string CurrentUserId, int Page = 1, int PageSize = 20) : IRequest<List<PostDto>>;

public class GetUserPostsQueryHandler : IRequestHandler<GetUserPostsQuery, List<PostDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ITmdbService _tmdbService;

    public GetUserPostsQueryHandler(IApplicationDbContext context, ITmdbService tmdbService)
    {
        _context = context;
        _tmdbService = tmdbService;
    }

    public async Task<List<PostDto>> Handle(GetUserPostsQuery request, CancellationToken cancellationToken)
    {
        var posts = await _context.Posts
            .Where(p => p.UserId == request.UserId)
            .Include(p => p.User)
            .OrderByDescending(p => p.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var result = new List<PostDto>();

        foreach (var post in posts)
        {
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

            result.Add(dto);
        }

        return result;
    }
}
