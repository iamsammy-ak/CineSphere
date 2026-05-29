using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Features.Users.Queries;
using CineSphere.Application.Features.Posts.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSphere.Api.Controllers;

[ApiController]
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
        var result = await _mediator.Send(new Application.Features.Posts.Queries.GetUserProfileQuery(userId));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("{userId}/posts")]
    public async Task<IActionResult> GetUserPosts(string userId, [FromQuery] int page = 1)
    {
        var myId = _currentUserService.GetUserId() ?? "";
        var result = await _mediator.Send(new Application.Features.Posts.Queries.GetUserPostsQuery(userId, myId, page, 20));
        return Ok(result);
    }

    [HttpGet("{userId}/followers")]
    public async Task<IActionResult> GetFollowers(string userId, [FromQuery] int page = 1)
    {
        var result = await _mediator.Send(new Application.Features.Follows.Queries.GetFollowersQuery(userId, page));
        return Ok(result);
    }

    [HttpGet("{userId}/following")]
    public async Task<IActionResult> GetFollowing(string userId, [FromQuery] int page = 1)
    {
        var result = await _mediator.Send(new Application.Features.Follows.Queries.GetFollowingQuery(userId, page));
        return Ok(result);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchUsers([FromQuery] string query, [FromQuery] int page = 1)
    {
        var currentUserId = _currentUserService.GetUserId() ?? "";
        if (string.IsNullOrWhiteSpace(query)) return BadRequest();
        var result = await _mediator.Send(new SearchUsersQuery(query, currentUserId, page));
        return Ok(result);
    }
}
