using CineSphere.Application.Common.Interfaces;
using CineSphere.Domain.Entities;

namespace CineSphere.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IApplicationDbContext _context;

    public NotificationService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task SendAsync(string userId, string actorId, string type, Guid? postId, string message)
    {
        if (userId == actorId) return;

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ActorId = actorId,
            Type = type,
            PostId = postId,
            Message = message,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
    }
}
