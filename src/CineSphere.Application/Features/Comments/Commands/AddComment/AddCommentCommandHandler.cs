using CineSphere.Application.Common.Models.CommentDto;
using CineSphere.Application.Common.Interfaces;
using CineSphere.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Features.Comments.Commands.AddComment;

public record AddCommentCommand(
    string UserId,
    Guid PostId,
    string Text
) : IRequest<CommentDto>;

public class AddCommentCommandHandler : IRequestHandler<AddCommentCommand, CommentDto>
{
    private readonly IApplicationDbContext _context;

    public AddCommentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CommentDto> Handle(AddCommentCommand request, CancellationToken cancellationToken)
    {
        var post = await _context.Posts.FindAsync(new object[] { request.PostId }, cancellationToken);
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
        await _context.SaveChangesAsync(cancellationToken);

        var user = await _context.Users.FindAsync(new object[] { request.UserId }, cancellationToken);

        return new CommentDto
        {
            Id = comment.Id,
            UserId = comment.UserId,
            UserDisplayName = user?.UserName ?? request.UserId,
            UserAvatarUrl = user?.AvatarUrl,
            Text = comment.Text,
            CreatedAt = comment.CreatedAt
        };
    }
}
