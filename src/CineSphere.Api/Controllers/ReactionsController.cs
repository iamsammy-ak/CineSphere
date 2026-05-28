using CineSphere.Application.Features.Reactions.Commands.ToggleReaction;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSphere.Api.Controllers;

[ApiController]
[Route("api/reactions")]
[Authorize]
public class ReactionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReactionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("toggle")]
    public async Task<IActionResult> ToggleReaction([FromBody] ToggleReactionCommand command, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(command.UserId))
            return BadRequest("UserId is required.");

        if (command.PostId == Guid.Empty)
            return BadRequest("PostId is required.");

        try
        {
            var result = await _mediator.Send(command, cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
