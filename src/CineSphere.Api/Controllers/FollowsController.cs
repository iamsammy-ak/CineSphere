using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Features.Follows.Commands.FollowUser;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FollowsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public FollowsController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpPost]
    public async Task<IActionResult> ToggleFollow([FromBody] FollowUserRequest request)
    {
        var userId = _currentUserService.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (userId == request.TargetUserId)
            return BadRequest(new { message = "You cannot follow yourself." });

        var command = new FollowUserCommand(userId, request.TargetUserId);
        var isFollowing = await _mediator.Send(command);

        return Ok(new { isFollowing });
    }
}

public class FollowUserRequest
{
    public string TargetUserId { get; set; } = string.Empty;
}
