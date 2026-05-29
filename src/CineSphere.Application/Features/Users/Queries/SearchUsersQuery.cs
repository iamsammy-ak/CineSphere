using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Features.Follows.Queries;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Features.Users.Queries;

public record SearchUsersQuery(string Query, string CurrentUserId, int Page = 1) : IRequest<List<UserSummaryDto>>;

public class SearchUsersQueryHandler : IRequestHandler<SearchUsersQuery, List<UserSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    public SearchUsersQueryHandler(IApplicationDbContext context) { _context = context; }

    public async Task<List<UserSummaryDto>> Handle(SearchUsersQuery request, CancellationToken ct)
    {
        var q = request.Query.ToLower();
        var users = await _context.Users
            .Where(u =>
                (EF.Functions.ILike(u.DisplayName, $"%{q}%")) &&
                u.Id != request.CurrentUserId &&
                u.IsActive == true)
            .Skip((request.Page - 1) * 20)
            .Take(20)
            .ToListAsync(ct);

        var userIds = users.Select(u => u.Id).ToList();
        var myFollows = await _context.UserFollows
            .Where(uf => uf.FollowerId == request.CurrentUserId && userIds.Contains(uf.FolloweeId))
            .Select(uf => uf.FolloweeId)
            .ToListAsync(ct);

        return users
            .Select(u => new UserSummaryDto(u.Id, u.DisplayName, u.AvatarUrl, myFollows.Contains(u.Id)))
            .ToList();
    }
}
