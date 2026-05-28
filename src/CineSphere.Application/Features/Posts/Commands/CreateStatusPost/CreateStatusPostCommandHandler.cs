using CineSphere.Application.Common.Models;
using CineSphere.Application.Common.Interfaces;
using CineSphere.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Features.Posts.Commands.CreateStatusPost;

public record CreateStatusPostCommand(
    string UserId,
    string Content,
    bool IsSpoiler
) : IRequest<PostDto>;

public class CreateStatusPostCommandHandler : IRequestHandler<CreateStatusPostCommand, PostDto>
{
    private readonly IApplicationDbContext _context;

    public CreateStatusPostCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PostDto> Handle(CreateStatusPostCommand request, CancellationToken cancellationToken)
    {
        var post = new StatusPost
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Content = request.Content,
            IsSpoiler = false,
            CreatedAt = DateTime.UtcNow,
            CommentCount = 0,
            ReactionCount = 0
        };

        _context.Posts.Add(post);
        await _context.SaveChangesAsync(cancellationToken);

        var user = await _context.Users.FindAsync(new object[] { request.UserId }, cancellationToken);

        return new PostDto
        {
            Id = post.Id,
            UserId = post.UserId,
            UserDisplayName = user?.UserName ?? request.UserId,
            UserAvatarUrl = user?.AvatarUrl,
            CreatedAt = post.CreatedAt,
            Content = post.Content,
            IsSpoiler = post.IsSpoiler,
            CommentCount = post.CommentCount,
            ReactionCount = post.ReactionCount,
            PostType = "Status"
        };
    }
}
