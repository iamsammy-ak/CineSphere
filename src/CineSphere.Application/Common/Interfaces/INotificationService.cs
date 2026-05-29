using CineSphere.Domain.Entities;

namespace CineSphere.Application.Common.Interfaces;

public interface INotificationService
{
    Task SendAsync(string userId, string actorId, string type, Guid? postId, string message);
}
