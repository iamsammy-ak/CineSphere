using CineSphere.Application.Common.Interfaces;
using CineSphere.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Features.Follows.Commands.FollowUser;

public record FollowUserCommand(string FollowerId, string FolloweeId) : IRequest<bool>;

public class FollowUserCommandHandler : IRequestHandler<FollowUserCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public FollowUserCommandHandler(IApplicationDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<bool> Handle(FollowUserCommand request, CancellationToken ct)
    {
        if (request.FollowerId == request.FolloweeId) return false;

        var existing = await _context.UserFollows
            .FirstOrDefaultAsync(uf => uf.FollowerId == request.FollowerId && uf.FolloweeId == request.FolloweeId, ct);

        if (existing != null)
        {
            _context.UserFollows.Remove(existing);
            await _context.SaveChangesAsync(ct);
            return false;
        }
        else
        {
            var follow = new UserFollow
            {
                FollowerId = request.FollowerId,
                FolloweeId = request.FolloweeId,
                CreatedAt = DateTime.UtcNow
            };

            _context.UserFollows.Add(follow);
            await _context.SaveChangesAsync(ct);

            // Notify the followed user
            var follower = await _context.Users.FindAsync(new object[] { request.FollowerId }, ct);
            var followerName = follower?.DisplayName ?? request.FollowerId;
            await _notificationService.SendAsync(request.FolloweeId, request.FollowerId, "Follow", null, $"started following you");

            return true;
        }
    }
}
