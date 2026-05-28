using CineSphere.Application.Common.Models;

namespace CineSphere.Application.Common.Interfaces;

public interface ITmdbService
{
    Task<TmdbMovieDto?> GetMovieByIdAsync(int movieId, CancellationToken cancellationToken = default);
}
