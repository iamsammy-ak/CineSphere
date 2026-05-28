using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Features.Posts.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public UsersController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetProfile(string userId)
    {
        var result = await _mediator.Send(new GetUserProfileQuery(userId));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("{userId}/posts")]
    public async Task<IActionResult> GetUserPosts(string userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var myId = _currentUserService.GetUserId();
        var result = await _mediator.Send(new GetUserPostsQuery(userId, myId ?? "", page, pageSize));
        return Ok(result);
    }

    [HttpGet("{userId}/followers")]
    public async Task<IActionResult> GetFollowers(string userId, [FromQuery] int page = 1)
    {
        var result = await _mediator.Send(new GetFollowersQuery(userId, page));
        return Ok(result);
    }

    [HttpGet("{userId}/following")]
    public async Task<IActionResult> GetFollowing(string userId, [FromQuery] int page = 1)
    {
        var result = await _mediator.Send(new GetFollowingQuery(userId, page));
        return Ok(result);
    }
}
