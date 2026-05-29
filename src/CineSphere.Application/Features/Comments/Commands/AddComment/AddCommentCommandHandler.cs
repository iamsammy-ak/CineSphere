using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Common.Models;
using CineSphere.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Features.Comments.Commands.AddComment;

public record AddCommentCommand(string UserId, Guid PostId, string Text) : IRequest<CommentDto>;

public class AddCommentCommandHandler : IRequestHandler<AddCommentCommand, CommentDto>
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public AddCommentCommandHandler(IApplicationDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<CommentDto> Handle(AddCommentCommand request, CancellationToken ct)
    {
        var post = await _context.Posts
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == request.PostId, ct);

        if (post == null)
            throw new InvalidOperationException($"Post with ID {request.PostId} not found.");

        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            PostId = request.PostId,
            UserId = request.UserId,
            Text = request.Text,
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        post.CommentCount += 1;
        await _context.SaveChangesAsync(ct);

        // Notify post owner
        if (post.UserId != request.UserId)
        {
            var commenter = await _context.Users.FindAsync(new object[] { request.UserId }, ct);
            var commenterName = commenter?.DisplayName ?? request.UserId;
            await _notificationService.SendAsync(post.UserId, request.UserId, "Comment", post.Id, $" commented on your post: \"{request.Text.Substring(0, Math.Min(50, request.Text.Length))}...\"");
        }

        var user = await _context.Users.FindAsync(new object[] { request.UserId }, ct);

        return new CommentDto
        {
            Id = comment.Id,
            UserId = comment.UserId,
            UserDisplayName = user?.DisplayName ?? request.UserId,
            UserAvatarUrl = user?.AvatarUrl,
            Text = comment.Text,
            CreatedAt = comment.CreatedAt
        };
    }
}
