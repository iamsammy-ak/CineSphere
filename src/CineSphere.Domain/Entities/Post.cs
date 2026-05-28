namespace CineSphere.Domain.Entities;

public abstract class Post
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? Content { get; set; }
    public bool IsSpoiler { get; set; }
    public int CommentCount { get; set; }
    public int ReactionCount { get; set; }

    // Navigation
    public ApplicationUser User { get; set; } = null!;
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();
}

public class MovieLogPost : Post
{
    public int TmdbMovieId { get; set; }
    public decimal Rating { get; set; }
    public DateTime WatchedDate { get; set; }
    public bool IsRewatch { get; set; }
}

public class StatusPost : Post
{
    // General user thoughts — inherits Content as the status text
}

public class ListPost : Post
{
    public Guid ListId { get; set; }
    public CustomList List { get; set; } = null!;
}

public class CustomList
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<ListPost> ListPosts { get; set; } = new List<ListPost>();
}
