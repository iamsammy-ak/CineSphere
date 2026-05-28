using CineSphere.Application.Common.Interfaces;
using CineSphere.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Features.Follows.Queries;

public record GetFollowersQuery(string UserId, int Page = 1, int PageSize = 20) : IRequest<List<UserSummaryDto>>;
public record GetFollowingQuery(string UserId, int Page = 1, int PageSize = 20) : IRequest<List<UserSummaryDto>>;

public record UserSummaryDto(string UserId, string DisplayName, string? AvatarUrl, bool IsFollowing);

public class GetFollowersQueryHandler : IRequestHandler<GetFollowersQuery, List<UserSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetFollowersQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<UserSummaryDto>> Handle(GetFollowersQuery request, CancellationToken cancellationToken)
    {
        var myId = _currentUserService.GetUserId() ?? "";
        var followerIds = await _context.UserFollows
            .Where(uf => uf.FolloweeId == request.UserId)
            .Select(uf => uf.FollowerId)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var followers = await _context.Users
            .Where(u => followerIds.Contains(u.Id))
            .ToListAsync(cancellationToken);

        var myFollows = await _context.UserFollows
            .Where(uf => uf.FollowerId == myId && followerIds.Contains(uf.FolloweeId))
            .Select(uf => uf.FolloweeId)
            .ToListAsync(cancellationToken);

        return followers.Select(u => new UserSummaryDto(u.Id, u.DisplayName, u.AvatarUrl, myFollows.Contains(u.Id))).ToList();
    }
}

public class GetFollowingQueryHandler : IRequestHandler<GetFollowingQuery, List<UserSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetFollowingQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<UserSummaryDto>> Handle(GetFollowingQuery request, CancellationToken cancellationToken)
    {
        var myId = _currentUserService.GetUserId() ?? "";
        var followingIds = await _context.UserFollows
            .Where(uf => uf.FollowerId == request.UserId)
            .Select(uf => uf.FolloweeId)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var following = await _context.Users
            .Where(u => followingIds.Contains(u.Id))
            .ToListAsync(cancellationToken);

        var myFollows = await _context.UserFollows
            .Where(uf => uf.FollowerId == myId && followingIds.Contains(uf.FolloweeId))
            .Select(uf => uf.FolloweeId)
            .ToListAsync(cancellationToken);

        return following.Select(u => new UserSummaryDto(u.Id, u.DisplayName, u.AvatarUrl, myFollows.Contains(u.Id))).ToList();
    }
}
