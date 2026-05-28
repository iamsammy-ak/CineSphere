using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Common.Models;
using CineSphere.Domain.Entities;
using CineSphere.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Features.Reactions.Commands.ToggleReaction;

public class ToggleReactionCommandHandler : IRequestHandler<ToggleReactionCommand, ReactionResult>
{
    private readonly IApplicationDbContext _context;

    public ToggleReactionCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ReactionResult> Handle(ToggleReactionCommand request, CancellationToken cancellationToken)
    {
        var post = await _context.Posts
            .FirstOrDefaultAsync(p => p.Id == request.PostId, cancellationToken);

        if (post == null)
            throw new InvalidOperationException($"Post with ID '{request.PostId}' not found.");

        var existingReaction = await _context.Reactions
            .FirstOrDefaultAsync(r => r.PostId == request.PostId && r.UserId == request.UserId, cancellationToken);

        bool isReacted;

        if (existingReaction != null)
        {
            if (existingReaction.Type == request.Type)
            {
                // Same type → toggle off (remove)
                _context.Reactions.Remove(existingReaction);
                post.ReactionCount = Math.Max(0, post.ReactionCount - 1);
                isReacted = false;
            }
            else
            {
                // Different type → update to new type
                post.ReactionCount = Math.Max(0, post.ReactionCount - 1);
                await _context.SaveChangesAsync(cancellationToken);

                existingReaction.Type = request.Type;
                post.ReactionCount += 1;
                isReacted = true;
            }
        }
        else
        {
            // No existing reaction → insert new one
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
            isReacted = true;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new ReactionResult
        {
            IsReacted = isReacted,
            TotalReactions = post.ReactionCount,
            CurrentUserReaction = isReacted ? request.Type : null
        };
    }
}
