using CineSphere.Application.Features.Follows.Commands.FollowUser;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSphere.Api.Controllers;

[ApiController]
[Route("api/follows")]
[Authorize]
public class FollowsController : ControllerBase
{
    private readonly IMediator _mediator;

    public FollowsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> ToggleFollow([FromBody] FollowUserCommand command, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(command.FollowerId) || string.IsNullOrEmpty(command.FolloweeId))
            return BadRequest("FollowerId and FolloweeId are required.");

        try
        {
            var isNowFollowing = await _mediator.Send(command, cancellationToken);
            return Ok(new
            {
                followed = isNowFollowing,
                message = isNowFollowing ? "User followed successfully." : "User unfollowed successfully."
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
