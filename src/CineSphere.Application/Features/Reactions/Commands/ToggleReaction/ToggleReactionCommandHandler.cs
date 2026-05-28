using CineSphere.Application.Common.Models;
using CineSphere.Application.Common.Interfaces;
using CineSphere.Domain.Entities;
using CineSphere.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Features.Reactions.Commands.ToggleReaction;

public record ToggleReactionCommand(
    string UserId,
    Guid PostId,
    ReactionType Type
) : IRequest<ReactionResult>;

public class ToggleReactionCommandHandler : IRequestHandler<ToggleReactionCommand, ReactionResult>
{
    private readonly IApplicationDbContext _context;

    public ToggleReactionCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ReactionResult> Handle(ToggleReactionCommand request, CancellationToken cancellationToken)
    {
        var existingReaction = await _context.Reactions
            .FirstOrDefaultAsync(r => r.PostId == request.PostId && r.UserId == request.UserId, cancellationToken);

        var post = await _context.Posts.FindAsync(new object[] { request.PostId }, cancellationToken);
        if (post == null)
            return new ReactionResult { IsReacted = false, TotalReactions = 0 };

        if (existingReaction != null)
        {
            if (existingReaction.Type == request.Type)
            {
                _context.Reactions.Remove(existingReaction);
                post.ReactionCount = Math.Max(0, post.ReactionCount - 1);
                await _context.SaveChangesAsync(cancellationToken);

                return new ReactionResult
                {
                    IsReacted = false,
                    TotalReactions = post.ReactionCount,
                    CurrentUserReaction = null
                };
            }
            else
            {
                existingReaction.Type = request.Type;
                await _context.SaveChangesAsync(cancellationToken);

                return new ReactionResult
                {
                    IsReacted = true,
                    TotalReactions = post.ReactionCount,
                    CurrentUserReaction = request.Type
                };
            }
        }
        else
        {
            var newReaction = new Reaction
            {
                Id = Guid.NewGuid(),
                PostId = request.PostId,
                UserId = request.UserId,
                Type = request.Type,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reactions.Add(newReaction);
            post.ReactionCount += 1;
            await _context.SaveChangesAsync(cancellationToken);

            return new ReactionResult
            {
                IsReacted = true,
                TotalReactions = post.ReactionCount,
                CurrentUserReaction = request.Type
            };
        }
    }
}
