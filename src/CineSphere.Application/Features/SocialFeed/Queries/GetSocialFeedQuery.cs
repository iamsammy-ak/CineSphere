using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Common.Models;
using CineSphere.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Features.SocialFeed.Queries;

public record GetSocialFeedQuery(string UserId, int Page = 1, int PageSize = 20) : IRequest<SocialFeedResponse>;

public record SocialFeedResponse(List<PostDto> Posts, int Page, int TotalPages, int TotalCount);

public class GetSocialFeedQueryHandler : IRequestHandler<GetSocialFeedQuery, SocialFeedResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ITmdbService _tmdbService;

    public GetSocialFeedQueryHandler(IApplicationDbContext context, ITmdbService tmdbService)
    {
        _context = context;
        _tmdbService = tmdbService;
    }

    public async Task<SocialFeedResponse> Handle(GetSocialFeedQuery request, CancellationToken cancellationToken)
    {
        var followingIds = await _context.UserFollows
            .Where(uf => uf.FollowerId == request.UserId)
            .Select(uf => uf.FolloweeId)
            .ToListAsync(cancellationToken);

        var allUserIds = new List<string> { request.UserId };
        allUserIds.AddRange(followingIds);

        var totalCount = await _context.Posts
            .Where(p => allUserIds.Contains(p.UserId))
            .CountAsync(cancellationToken);

        var totalPages = totalCount == 0 ? 1 : (int)Math.Ceiling((double)totalCount / request.PageSize);

        var posts = await _context.Posts
            .Where(p => allUserIds.Contains(p.UserId))
            .Include(p => p.User)
            .OrderByDescending(p => p.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var postDtos = new List<PostDto>();

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

            postDtos.Add(dto);
        }

        return new SocialFeedResponse(postDtos, request.Page, totalPages, totalCount);
    }
}
