using CineSphere.Application.Common.Models;

namespace CineSphere.Application.Common.Interfaces;

public interface ITmdbService
{
    Task<TmdbMovieDto?> GetMovieByIdAsync(int movieId, CancellationToken cancellationToken = default);
    Task<TmdbSearchResponse?> SearchMoviesAsync(string query, int page, CancellationToken cancellationToken = default);
}

public class TmdbSearchResponse
{
    public List<TmdbMovieDto> Results { get; set; } = new();
    public int TotalPages { get; set; }
    public int TotalResults { get; set; }
}
