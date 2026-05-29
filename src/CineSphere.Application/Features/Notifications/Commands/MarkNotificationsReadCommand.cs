using CineSphere.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;


namespace CineSphere.Application.Features.Notifications.Commands;

public record MarkNotificationsReadCommand(string UserId) : IRequest<int>;

public class MarkNotificationsReadCommandHandler : IRequestHandler<MarkNotificationsReadCommand, int>
{
    private readonly IApplicationDbContext _context;
    public MarkNotificationsReadCommandHandler(IApplicationDbContext context) { _context = context; }
    public async Task<int> Handle(MarkNotificationsReadCommand request, CancellationToken ct)
    {
        return await _context.Notifications
            .Where(n => n.UserId == request.UserId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true), ct);
    }
}
