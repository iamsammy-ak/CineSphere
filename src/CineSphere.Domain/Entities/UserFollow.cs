namespace CineSphere.Domain.Entities;

public class UserFollow
{
    public string FollowerId { get; set; } = string.Empty;
    public string FolloweeId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ApplicationUser Follower { get; set; } = null!;
    public ApplicationUser Followee { get; set; } = null!;
}
