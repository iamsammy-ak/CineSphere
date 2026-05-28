using CineSphere.Application.Common.Interfaces;
using CineSphere.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Features.Follows.Commands.FollowUser;

public class FollowUserCommandHandler : IRequestHandler<FollowUserCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public FollowUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(FollowUserCommand request, CancellationToken cancellationToken)
    {
        if (string.Equals(request.FollowerId, request.FolloweeId, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Users cannot follow themselves.");

        var existingFollow = await _context.UserFollows
            .FirstOrDefaultAsync(uf => uf.FollowerId == request.FollowerId && uf.FolloweeId == request.FolloweeId, cancellationToken);

        if (existingFollow != null)
        {
            // Already following → unfollow (toggle off)
            _context.UserFollows.Remove(existingFollow);
            await _context.SaveChangesAsync(cancellationToken);
            return false;
        }

        // Not following → create new follow
        var follow = new UserFollow
        {
            FollowerId = request.FollowerId,
            FolloweeId = request.FolloweeId,
            CreatedAt = DateTime.UtcNow
        };

        _context.UserFollows.Add(follow);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
