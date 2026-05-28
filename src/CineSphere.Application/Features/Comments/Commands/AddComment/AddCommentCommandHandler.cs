using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Common.Models;
using CineSphere.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Features.Comments.Commands.AddComment;

public class AddCommentCommandHandler : IRequestHandler<AddCommentCommand, CommentDto>
{
    private readonly IApplicationDbContext _context;

    public AddCommentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CommentDto> Handle(AddCommentCommand request, CancellationToken cancellationToken)
    {
        var post = await _context.Posts
            .FirstOrDefaultAsync(p => p.Id == request.PostId, cancellationToken);

        if (post == null)
            throw new InvalidOperationException($"Post with ID '{request.PostId}' not found.");

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

        await _context.SaveChangesAsync(cancellationToken);

        var user = await _context.Users.FindAsync([request.UserId], cancellationToken);

        return new CommentDto
        {
            Id = comment.Id,
            UserId = comment.UserId,
            UserDisplayName = user?.DisplayName ?? "Unknown",
            UserAvatarUrl = user?.AvatarUrl,
            Text = comment.Text,
            CreatedAt = comment.CreatedAt
        };
    }
}
