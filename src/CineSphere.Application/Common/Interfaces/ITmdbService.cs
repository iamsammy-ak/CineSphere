using CineSphere.Application.Common.Models;
using CineSphere.Application.Common.Interfaces;

namespace CineSphere.Application.Common.Interfaces;

public interface ITmdbService
{
    Task<TmdbMovieDto?> GetMovieByIdAsync(int movieId, CancellationToken cancellationToken = default);
    Task<TmdbSearchResult?> SearchMoviesAsync(string query, int page, CancellationToken cancellationToken = default);
}

public class TmdbSearchResult
{
    public List<TmdbMovieDto> Results { get; set; } = new();
    public int TotalPages { get; set; }
    public int TotalResults { get; set; }
}
