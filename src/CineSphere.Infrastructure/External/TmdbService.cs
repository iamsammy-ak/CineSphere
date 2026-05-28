using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Common.Models;
using System.Text.Json;

namespace CineSphere.Infrastructure.External;


public class TmdbService : ITmdbService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

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
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var tmdbResponse = await JsonSerializer.DeserializeAsync<TmdbMovieRaw>(stream, options, cancellationToken);

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

    public async Task<TmdbSearchResponse?> SearchMoviesAsync(string query, int page, CancellationToken cancellationToken)
    {
        try
        {
            var url = $"https://api.themoviedb.org/3/search/movie?api_key={_apiKey}&query={Uri.EscapeDataString(query)}&page={page}&language=en-US";
            var response = await _httpClient.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode) return null;

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var searchResult = await JsonSerializer.DeserializeAsync<TmdbSearchRaw>(stream, options, cancellationToken);

            if (searchResult == null) return null;

            return new TmdbSearchResponse(
                searchResult.Results.Select(r => new TmdbMovieDto
                {
                    Id = r.Id,
                    Title = r.Title ?? string.Empty,
                    PosterPath = r.PosterPath != null
                        ? $"https://image.tmdb.org/t/p/w500{r.PosterPath}"
                        : null,
                    Overview = r.Overview,
                    VoteCount = r.VoteCount
                }).ToList(),
                searchResult.TotalPages,
                searchResult.TotalResults
            );
        }
        catch
        {
            return null;
        }
    }

    private class TmdbMovieRaw
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? PosterPath { get; set; }
        public string? Overview { get; set; }
        public int? VoteCount { get; set; }
    }

    private class TmdbSearchRaw
    {
        public List<TmdbMovieRaw> Results { get; set; } = new();
        public int TotalPages { get; set; }
        public int TotalResults { get; set; }
    }
}
