using CineSphere.Application.Common.Models;
using CineSphere.Application.Features.SocialFeed.Queries;
using CineSphere.Domain.Entities;
using MediatR;

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
        // Get IDs of users the current user follows
        var followingIds = await _context.UserFollows
            .Where(uf => uf.FollowerId == request.UserId)
            .Select(uf => uf.FolloweeId)
            .ToListAsync(cancellationToken);

        var allPostIds = new List<string> { request.UserId };
        allPostIds.AddRange(followingIds);

        var query = _context.Posts
            .Where(p => allPostIds.Contains(p.UserId))
            .OrderByDescending(p => p.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        var posts = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var postDtos = new List<PostDto>();

        foreach (var post in posts)
        {
            var dto = MapPostToDto(post);

            if (post is MovieLogPost mlp)
            {
                dto.Movie = await _tmdbService.GetMovieByIdAsync(mlp.TmdbMovieId, cancellationToken);
            }

            postDtos.Add(dto);
        }

        return new SocialFeedResponse(postDtos, request.Page, totalPages, totalCount);
    }

    private PostDto MapPostToDto(Post post)
    {
        return new PostDto
        {
            Id = post.Id,
            UserId = post.UserId,
            UserDisplayName = post.User.UserName ?? post.UserId,
            UserAvatarUrl = post.User.AvatarUrl,
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
    }
}
