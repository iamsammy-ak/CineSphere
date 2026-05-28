using CineSphere.Application.Common.Interfaces;
using CineSphere.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Features.Posts.Queries;

public record GetUserProfileQuery(string UserId) : IRequest<UserProfileDto?>;

public record UserProfileDto
{
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public DateTime CreatedAt { get; set; }
    public int FilmCount { get; set; }
    public int FollowersCount { get; set; }
    public int FollowingCount { get; set; }
    public bool IsFollowing { get; set; }
}

public class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, UserProfileDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetUserProfileQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<UserProfileDto?> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(new object[] { request.UserId }, cancellationToken);
        if (user == null) return null;

        var myId = _currentUserService.GetUserId() ?? "";
        var isFollowing = !string.IsNullOrEmpty(myId) &&
            await _context.UserFollows.AnyAsync(uf => uf.FollowerId == myId && uf.FolloweeId == request.UserId, cancellationToken);

        var filmCount = await _context.Posts.CountAsync(p => p.UserId == request.UserId, cancellationToken);
        var followersCount = await _context.UserFollows.CountAsync(uf => uf.FolloweeId == request.UserId, cancellationToken);
        var followingCount = await _context.UserFollows.CountAsync(uf => uf.FollowerId == request.UserId, cancellationToken);

        return new UserProfileDto
        {
            UserId = user.Id,
            UserName = user.UserName ?? user.Id,
            DisplayName = user.DisplayName,
            AvatarUrl = user.AvatarUrl,
            Bio = user.Bio,
            CreatedAt = user.CreatedAt,
            FilmCount = filmCount,
            FollowersCount = followersCount,
            FollowingCount = followingCount,
            IsFollowing = isFollowing
        };
    }
}
