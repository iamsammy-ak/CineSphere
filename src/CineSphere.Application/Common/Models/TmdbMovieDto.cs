namespace CineSphere.Application.Common.Models;

public class TmdbMovieDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? PosterPath { get; set; }
    public string? Overview { get; set; }
    public int? VoteCount { get; set; }
}
