using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Common.Models;
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
    private readonly INotificationService _notificationService;

    public ToggleReactionCommandHandler(IApplicationDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<ReactionResult> Handle(ToggleReactionCommand request, CancellationToken ct)
    {
        var existingReaction = await _context.Reactions
            .FirstOrDefaultAsync(r => r.PostId == request.PostId && r.UserId == request.UserId, ct);

        var post = await _context.Posts.FindAsync(new object[] { request.PostId }, ct);
        if (post == null)
            return new ReactionResult { IsReacted = false, TotalReactions = 0 };

        if (existingReaction != null)
        {
            if (existingReaction.Type == request.Type)
            {
                _context.Reactions.Remove(existingReaction);
                post.ReactionCount = Math.Max(0, post.ReactionCount - 1);
                await _context.SaveChangesAsync(ct);
                return new ReactionResult { IsReacted = false, TotalReactions = post.ReactionCount, CurrentUserReaction = null };
            }
            else
            {
                existingReaction.Type = request.Type;
                await _context.SaveChangesAsync(ct);
                return new ReactionResult { IsReacted = true, TotalReactions = post.ReactionCount, CurrentUserReaction = request.Type };
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
            await _context.SaveChangesAsync(ct);

            // Send notification to post owner
            var actorName = (await _context.Users.FindAsync(new object[] { request.UserId }, ct))?.DisplayName ?? request.UserId;
            var emoji = request.Type switch { ReactionType.Like => "❤️", ReactionType.Popcorn => "🍿", ReactionType.MindBlown => "🧠", _ => "👍" };
            await _notificationService.SendAsync(post.UserId, request.UserId, "Reaction", post.Id, $" {emoji} to your post");

            return new ReactionResult { IsReacted = true, TotalReactions = post.ReactionCount, CurrentUserReaction = request.Type };
        }
    }
}
