using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Features.Posts.Commands;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Features.Posts.Commands;

public record DeletePostCommand(string UserId, Guid PostId) : IRequest<bool>;

public class DeletePostCommandHandler : IRequestHandler<DeletePostCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public DeletePostCommandHandler(IApplicationDbContext context) { _context = context; }

    public async Task<bool> Handle(DeletePostCommand request, CancellationToken ct)
    {
        var post = await _context.Posts
            .FirstOrDefaultAsync(p => p.Id == request.PostId && p.UserId == request.UserId, ct);
        if (post == null) return false;
        _context.Posts.Remove(post);
        await _context.SaveChangesAsync(ct);
        return true;
    }
}
