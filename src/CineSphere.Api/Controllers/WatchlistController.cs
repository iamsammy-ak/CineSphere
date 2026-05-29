using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Features.Watchlist.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WatchlistController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public WatchlistController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetWatchlist()
    {
        var userId = _currentUserService.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        var result = await _mediator.Send(new GetWatchlistQuery(userId));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> AddToWatchlist([FromBody] WatchlistRequest request)
    {
        var userId = _currentUserService.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        var result = await _mediator.Send(new AddToWatchlistCommand(userId, request.TmdbMovieId, request.Title, request.PosterPath));
        return result ? Ok() : Conflict(new { message = "Already in watchlist" });
    }

    [HttpDelete("{tmdbMovieId:int}")]
    public async Task<IActionResult> RemoveFromWatchlist(int tmdbMovieId)
    {
        var userId = _currentUserService.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        var result = await _mediator.Send(new RemoveFromWatchlistCommand(userId, tmdbMovieId));
        return result ? Ok() : NotFound();
    }
}

public class WatchlistRequest
{
    public int TmdbMovieId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? PosterPath { get; set; }
}
