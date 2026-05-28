using CineSphere.Application.Common.Models;
using CineSphere.Application.Common.Interfaces;
using MediatR;

namespace CineSphere.Application.Features.Movies.Queries;

public record SearchMoviesQuery(string Query, int Page = 1) : IRequest<TmdbSearchResponse>;

public record TmdbSearchResponse(List<TmdbMovieDto> Results, int TotalPages, int TotalResults);

public class SearchMoviesQueryHandler : IRequestHandler<SearchMoviesQuery, TmdbSearchResponse>
{
    private readonly ITmdbService _tmdbService;

    public SearchMoviesQueryHandler(ITmdbService tmdbService)
    {
        _tmdbService = tmdbService;
    }

    Implement the Handle method. Use _tmdbService.SearchMoviesAsync(query, page) — add that method to ITmdbService too. Return TmdbSearchResponse.

    public async Task<TmdbSearchResponse> Handle(SearchMoviesQuery request, CancellationToken cancellationToken)
    {
        Use _tmdbService.SearchMoviesAsync(request.Query, request.Page) to fetch movie results
        var result = await _tmdbService.SearchMoviesAsync(request.Query, request.Page, cancellationToken);
        return result ?? new TmdbSearchResponse(new List<TmdbMovieDto>(), 0, 0);
    }
}
