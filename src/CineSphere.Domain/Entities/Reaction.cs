using CineSphere.Domain.Enums;

namespace CineSphere.Domain.Entities;

public class Reaction
{
    public Guid Id { get; set; }
    public Guid PostId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public ReactionType Type { get; set; } = ReactionType.Like;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Post Post { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
}
