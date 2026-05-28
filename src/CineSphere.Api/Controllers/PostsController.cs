using CineSphere.Application.Features.Posts.Commands.CreateMovieLogPost;
using CineSphere.Application.Features.Posts.Commands.CreateStatusPost;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSphere.Api.Controllers;

[ApiController]
[Route("api/posts")]
[Authorize]
public class PostsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PostsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("movie-log")]
    public async Task<IActionResult> CreateMovieLogPost([FromBody] CreateMovieLogPostCommand command, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(command.UserId))
            return BadRequest("UserId is required.");

        if (command.Rating < 0 || command.Rating > 10)
            return BadRequest("Rating must be between 0 and 10.");

        var result = await _mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(CreateMovieLogPost), new { id = result.Id }, result);
    }

    [HttpPost("status")]
    public async Task<IActionResult> CreateStatusPost([FromBody] CreateStatusPostCommand command, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(command.UserId))
            return BadRequest("UserId is required.");

        if (string.IsNullOrWhiteSpace(command.Content))
            return BadRequest("Content cannot be empty.");

        var result = await _mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(CreateStatusPost), new { id = result.Id }, result);
    }
}
