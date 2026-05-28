using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Features.Posts.Commands.CreateListPost;
using CineSphere.Application.Features.Posts.Commands.CreateMovieLogPost;
using CineSphere.Application.Features.Posts.Commands.CreateStatusPost;
using CineSphere.Application.Features.Posts.Queries;
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

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPost(Guid id)
    {
        var result = await _mediator.Send(new GetPostByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
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
        return CreatedAtAction(nameof(GetPost), new { id = result.Id }, result);
    }

    [HttpPost("status")]
    public async Task<IActionResult> CreateStatus([FromBody] CreateStatusPostRequest request)
    {
        var userId = _currentUserService.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var command = new CreateStatusPostCommand(userId, request.Content, false);
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetPost), new { id = result.Id }, result);
    }

    [HttpPost("list")]
    public async Task<IActionResult> CreateListPost([FromBody] CreateListPostRequest request)
    {
        var userId = _currentUserService.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        try
        {
            var command = new CreateListPostCommand(userId, request.ListId, request.Content, request.IsSpoiler);
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetPost), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
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

public class CreateListPostRequest
{
    public Guid ListId { get; set; }
    public string? Content { get; set; }
    public bool IsSpoiler { get; set; }
}
