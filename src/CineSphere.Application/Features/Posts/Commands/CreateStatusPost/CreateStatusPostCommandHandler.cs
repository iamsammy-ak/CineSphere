using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Common.Models;
using CineSphere.Domain.Entities;
using MediatR;

namespace CineSphere.Application.Features.Posts.Commands.CreateStatusPost;

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
            IsSpoiler = request.IsSpoiler,
            CreatedAt = DateTime.UtcNow,
            CommentCount = 0,
            ReactionCount = 0
        };

        _context.StatusPosts.Add(post);
        await _context.SaveChangesAsync(cancellationToken);

        var user = await _context.Users.FindAsync([post.UserId], cancellationToken);

        return new PostDto
        {
            Id = post.Id,
            UserId = post.UserId,
            UserDisplayName = user?.DisplayName ?? "Unknown",
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
