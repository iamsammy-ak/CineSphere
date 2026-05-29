namespace CineSphere.Domain.Entities;

public class WatchlistItem
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int TmdbMovieId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? PosterPath { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    public ApplicationUser User { get; set; } = null!;
}
