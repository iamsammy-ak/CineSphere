using CineSphere.Application.Common.Models;
using MediatR;

namespace CineSphere.Application.Features.Posts.Commands.CreateMovieLogPost;

public record CreateMovieLogPostCommand(
    string UserId,
    int TmdbMovieId,
    decimal Rating,
    DateTime WatchedDate,
    bool IsRewatch,
    string? Content,
    bool IsSpoiler
) : IRequest<PostDto>;
