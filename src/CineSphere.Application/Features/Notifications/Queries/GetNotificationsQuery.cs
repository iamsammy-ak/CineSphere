using CineSphere.Application.Common.Interfaces;
using CineSphere.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;


namespace CineSphere.Application.Features.Notifications.Queries;

public record GetNotificationsQuery(string UserId, int Page = 1) : IRequest<NotificationListDto>;

public record NotificationListDto(List<NotificationDto> Items, int UnreadCount, int Page, int TotalCount);

public record NotificationDto(
    Guid Id,
    string ActorId,
    string ActorDisplayName,
    string? ActorAvatarUrl,
    string Type,
    Guid? PostId,
    string Message,
    bool IsRead,
    DateTime CreatedAt
);

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, NotificationListDto>
{
    private readonly IApplicationDbContext _context;

    public GetNotificationsQueryHandler(IApplicationDbContext context) { _context = context; }
    public async Task<NotificationListDto> Handle(GetNotificationsQuery request, CancellationToken ct)
    {
        var query = _context.Notifications
            .Where(n => n.UserId == request.UserId)
            .OrderByDescending(n => n.CreatedAt);

        var total = await query.CountAsync(ct);
        var unread = await _context.Notifications
            .CountAsync(n => n.UserId == request.UserId && !n.IsRead, ct);

        var pageSize = 20;
        var items = await query
            .Skip((request.Page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);


        var actorIds = items.Select(n => n.ActorId).Distinct().ToList();
        var actors = await _context.Users
            .Where(u => actorIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, ct);


        var dtos = items.Select(n => new NotificationDto(
            n.Id,
            n.ActorId,
            actors.TryGetValue(n.ActorId, out var a) ? a.DisplayName : n.ActorId,
            actors.TryGetValue(n.ActorId, out var a2) ? a2.AvatarUrl : null,
            n.Type,
            n.PostId,
            n.Message,
            n.IsRead,
            n.CreatedAt
        )).ToList();


        return new NotificationListDto(dtos, unread, request.Page, total);
    }
}
