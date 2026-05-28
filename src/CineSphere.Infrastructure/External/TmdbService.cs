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
            var raw = await JsonSerializer.DeserializeAsync<TmdbMovieRaw>(stream, options, cancellationToken);
            if (raw == null) return null;

            return new TmdbMovieDto
            {
                Id = raw.Id,
                Title = raw.Title ?? string.Empty,
                PosterPath = raw.PosterPath != null ? $"https://image.tmdb.org/t/p/w500{raw.PosterPath}" : null,
                Overview = raw.Overview,
                VoteCount = raw.VoteCount
            };
        }
        catch { return null; }
    }

    public async Task<TmdbSearchResult?> SearchMoviesAsync(string query, int page, CancellationToken cancellationToken)
    {
        try
        {
            var url = $"https://api.themoviedb.org/3/search/movie?api_key={_apiKey}&query={Uri.EscapeDataString(query)}&page={page}&language=en-US";
            var response = await _httpClient.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode) return null;

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var searchRaw = await JsonSerializer.DeserializeAsync<TmdbSearchRaw>(stream, options, cancellationToken);
            if (searchRaw == null) return null;

            return new TmdbSearchResult
            {
                Results = searchRaw.Results.Select(r => new TmdbMovieDto
                {
                    Id = r.Id,
                    Title = r.Title ?? string.Empty,
                    PosterPath = r.PosterPath != null ? $"https://image.tmdb.org/t/p/w500{r.PosterPath}" : null,
                    Overview = r.Overview,
                    VoteCount = r.VoteCount
                }).ToList(),
                TotalPages = searchRaw.TotalPages,
                TotalResults = searchRaw.TotalResults
            };
        }
        catch { return null; }
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
