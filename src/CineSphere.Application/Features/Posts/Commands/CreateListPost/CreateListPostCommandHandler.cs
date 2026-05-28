using CineSphere.Application.Common.Interfaces;
using CineSphere.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Features.Posts.Commands.CreateListPost;

public record CreateListPostCommand(
    string UserId,
    Guid ListId,
    string? Content,
    bool IsSpoiler
) : IRequest<PostDto>;

public class CreateListPostCommandHandler : IRequestHandler<CreateListPostCommand, PostDto>
{
    private readonly IApplicationDbContext _context;

    public CreateListPostCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PostDto> Handle(CreateListPostCommand request, CancellationToken cancellationToken)
    {
        var list = await _context.CustomLists.FindAsync(new object[] { request.ListId }, cancellationToken);
        if (list == null)
            throw new InvalidOperationException($"Custom list with ID {request.ListId} not found.");

        var post = new ListPost
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            ListId = request.ListId,
            Content = request.Content,
            IsSpoiler = request.IsSpoiler,
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
            PostType = "List"
        };
    }
}
