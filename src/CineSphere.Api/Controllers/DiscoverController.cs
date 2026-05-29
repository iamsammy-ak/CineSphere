using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Features.Discover.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DiscoverController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public DiscoverController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDiscover()
    {
        var userId = _currentUserService.GetUserId() ?? "";
        var result = await _mediator.Send(new GetDiscoverQuery(userId));
        return Ok(result);
    }
}
