using CineSphere.Application.Common.Interfaces;
using CineSphere.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FollowsController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public FollowsController(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    [HttpGet("{userId}/follow-status")]
    public async Task<IActionResult> GetFollowStatus(string userId)
    {
        var myId = _currentUserService.GetUserId() ?? "";
        if (string.IsNullOrEmpty(myId)) return Unauthorized();

        var isFollowing = await _context.UserFollows
            .AnyAsync(uf => uf.FollowerId == myId && uf.FolloweeId == userId);

        var followersCount = await _context.UserFollows.CountAsync(uf => uf.FolloweeId == userId);
        var followingCount = await _context.UserFollows.CountAsync(uf => uf.FollowerId == userId);
        var filmCount = await _context.Posts.CountAsync(p => p.UserId == userId);

        return Ok(new { isFollowing, followersCount, followingCount, filmCount });
    }
}
