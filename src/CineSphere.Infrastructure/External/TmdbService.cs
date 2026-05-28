using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Common.Models;
using System.Text.Json;

namespace CineSphere.Infrastructure.External;

public class TmdbService : ITmdbService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public TmdbService(HttpClient httpClient, string apiKey)
    {
        _httpClient = httpClient;
        _apiKey = apiKey;
    }

    public async Task<TmdbMovieDto?> GetMovieByIdAsync(int movieId, CancellationToken cancellationToken = default)
    {
        try
        {
            var url = $"https://api.themoviedb.org/3/movie/{movieId}?api_key={_apiKey}&language=en-US";
            var response = await _httpClient.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode) return null;

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            var tmdbResponse = await JsonSerializer.DeserializeAsync<TmdbRawResponse>(stream, JsonOptions, cancellationToken);

            if (tmdbResponse == null) return null;

            return new TmdbMovieDto
            {
                Id = tmdbResponse.Id,
                Title = tmdbResponse.Title ?? string.Empty,
                PosterPath = tmdbResponse.PosterPath != null
                    ? $"https://image.tmdb.org/t/p/w500{tmdbResponse.PosterPath}"
                    : null,
                Overview = tmdbResponse.Overview,
                VoteCount = tmdbResponse.VoteCount
            };
        }
        catch
        {
            return null;
        }
    }

    private class TmdbRawResponse
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? PosterPath { get; set; }
        public string? Overview { get; set; }
        public int? VoteCount { get; set; }
    }
}
