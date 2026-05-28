using CineSphere.Application.Common.Interfaces;
using CineSphere.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Features.Follows.Commands.FollowUser;

public record FollowUserCommand(string FollowerId, string FolloweeId) : IRequest<bool>;

public class FollowUserCommandHandler : IRequestHandler<FollowUserCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public FollowUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(FollowUserCommand request, CancellationToken cancellationToken)
    {
        if (request.FollowerId == request.FolloweeId)
            return false;

        var existing = await _context.UserFollows
            .FirstOrDefaultAsync(uf => uf.FollowerId == request.FollowerId && uf.FolloweeId == request.FolloweeId, cancellationToken);

        if (existing != null)
        {
            _context.UserFollows.Remove(existing);
            await _context.SaveChangesAsync(cancellationToken);
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
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
