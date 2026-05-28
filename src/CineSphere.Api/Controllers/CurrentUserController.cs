using System.Security.Claims;
using CineSphere.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CineSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CurrentUserController : ControllerBase
{
    private readonly ICurrentUserService _currentUserService;

    public CurrentUserController(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    [HttpGet("me")]
    public IActionResult GetCurrentUser()
    {
        var userId = _currentUserService.GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        return Ok(new { userId });
    }
}
