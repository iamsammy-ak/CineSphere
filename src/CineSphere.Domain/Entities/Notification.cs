namespace CineSphere.Domain.Entities;

public class Notification
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string ActorId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public Guid? PostId { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ApplicationUser User { get; set; } = null!;
    public Post? Post { get; set; }
}
