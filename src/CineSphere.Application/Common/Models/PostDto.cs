using CineSphere.Domain.Enums;

namespace CineSphere.Application.Common.Models;

public class PostDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserDisplayName { get; set; } = string.Empty;
    public string? UserAvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Content { get; set; }
    public bool IsSpoiler { get; set; }
    public int CommentCount { get; set; }
    public int ReactionCount { get; set; }
    public string PostType { get; set; } = string.Empty;
    public TmdbMovieDto? Movie { get; set; }
}

public class MovieLogPostDto : PostDto
{
    public int TmdbMovieId { get; set; }
    public decimal Rating { get; set; }
    public DateTime WatchedDate { get; set; }
    public bool IsRewatch { get; set; }
}

public class CommentDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserDisplayName { get; set; } = string.Empty;
    public string? UserAvatarUrl { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class ReactionDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public ReactionType Type { get; set; }
}
