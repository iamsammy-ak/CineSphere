using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Features.Reactions.Commands.ToggleReaction;
using CineSphere.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReactionsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public ReactionsController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpPost("toggle")]
    public async Task<IActionResult> ToggleReaction([FromBody] ToggleReactionRequest request)
    {
        var userId = _currentUserService.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var command = new ToggleReactionCommand(userId, request.PostId, request.Type);
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}

public class ToggleReactionRequest
{
    public Guid PostId { get; set; }
    public ReactionType Type { get; set; }
}
