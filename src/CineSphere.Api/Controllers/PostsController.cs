using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Features.Posts.Commands.CreateMovieLogPost;
using CineSphere.Application.Features.Posts.Commands.CreateStatusPost;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PostsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public PostsController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpPost("movie-log")]
    public async Task<IActionResult> CreateMovieLog([FromBody] CreateMovieLogPostRequest request)
    {
        var userId = _currentUserService.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var command = new CreateMovieLogPostCommand(
            userId,
            request.TmdbMovieId,
            request.Rating,
            request.WatchedDate,
            request.IsRewatch,
            request.Content,
            request.IsSpoiler
        );

        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(CreateMovieLog), new { id = result.Id }, result);
    }

    [HttpPost("status")]
    public async Task<IActionResult> CreateStatus([FromBody] CreateStatusPostRequest request)
    {
        var userId = _currentUserService.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var command = new CreateStatusPostCommand(userId, request.Content, false);
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(CreateStatus), new { id = result.Id }, result);
    }
}

public class CreateMovieLogPostRequest
{
    public int TmdbMovieId { get; set; }
    public decimal Rating { get; set; }
    public DateTime WatchedDate { get; set; }
    public bool IsRewatch { get; set; }
    public string? Content { get; set; }
    public bool IsSpoiler { get; set; }
}

public class CreateStatusPostRequest
{
    public string Content { get; set; } = string.Empty;
}
