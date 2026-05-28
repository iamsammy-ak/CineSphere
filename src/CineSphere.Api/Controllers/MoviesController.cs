using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Features.Movies.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MoviesController : ControllerBase
{
    private readonly IMediator _mediator;

    public MoviesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchMovies([FromQuery] string query, [FromQuery] int page = 1)
    {
        if (string.IsNullOrWhiteSpace(query))
            return BadRequest(new { message = "Search query is required." });

        var result = await _mediator.Send(new SearchMoviesQuery(query, page));
        return Ok(result);
    }
}
