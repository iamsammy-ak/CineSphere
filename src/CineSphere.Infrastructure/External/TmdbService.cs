using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Common.Models;

namespace CineSphere.Infrastructure.External;

public class TmdbService : ITmdbService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _apiKey;

    public TmdbService(IHttpClientFactory httpClientFactory, string apiKey)
    {
        _httpClientFactory = httpClientFactory;
        _apiKey = apiKey;
    }

    public async Task<TmdbMovieDto?> GetMovieByIdAsync(int movieId, CancellationToken cancellationToken = default)
    {
        var client = _httpClientFactory.CreateClient("TMDB");
        var response = await client.GetAsync(
            $"https://api.themoviedb.org/3/movie/{movieId}?api_key={_apiKey}&language=en-US",
            cancellationToken);

        if (!response.IsSuccessStatusCode) return null;

        var json = await response.Content.ReadAsStringAsync(cancellationToken);
        // In production, use System.Text.Json with source generators or JsonPropertyName attributes
        // For now we return a partial dto structure
        return new TmdbMovieDto { Id = movieId, PosterPath = $"https://image.tmdb.org/t/p/w500" };
    }
}
