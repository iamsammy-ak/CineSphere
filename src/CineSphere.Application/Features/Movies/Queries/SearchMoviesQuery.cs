using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Common.Models;
using MediatR;

namespace CineSphere.Application.Features.Movies.Queries;

public record SearchMoviesQuery(string Query, int Page = 1) : IRequest<MovieSearchResponse>;

public record MovieSearchResponse(List<TmdbMovieDto> Results, int TotalPages, int TotalResults);

public class SearchMoviesQueryHandler : IRequestHandler<SearchMoviesQuery, MovieSearchResponse>
{
    private readonly ITmdbService _tmdbService;

    public SearchMoviesQueryHandler(ITmdbService tmdbService)
    {
        _tmdbService = tmdbService;
    }

    public async Task<MovieSearchResponse> Handle(SearchMoviesQuery request, CancellationToken cancellationToken)
    {
        var result = await _tmdbService.SearchMoviesAsync(request.Query, request.Page, cancellationToken);
        return new MovieSearchResponse(
            result?.Results ?? new List<TmdbMovieDto>(),
            result?.TotalPages ?? 0,
            result?.TotalResults ?? 0
        );
    }
}
