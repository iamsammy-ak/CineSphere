using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Features.Notifications.Queries;
using CineSphere.Application.Features.Notifications.Commands;
using CineSphere.Application.Features.Discover.Queries;
using CineSphere.Application.Features.Watchlist.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSphere.Api.Controllers;

[ApiController]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;
    public NotificationsController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] int page = 1)
    {
        var userId = _currentUserService.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        var result = await _mediator.Send(new GetNotificationsQuery(userId, page));
        return Ok(result);
    }

    [HttpPost("mark-read")]
    public async Task<IActionResult> MarkRead()
    {
        var userId = _currentUserService.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        var count = await _mediator.Send(new MarkNotificationsReadCommand(userId));
        return Ok(new { markedCount = count });
    }
}
