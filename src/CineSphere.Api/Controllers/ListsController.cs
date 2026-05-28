using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Features.CustomLists.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ListsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public ListsController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateListRequest request)
    {
        var userId = _currentUserService.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var command = new CreateCustomListCommand(userId, request.Name, request.Description);
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(Create), new { id = result.Id }, result);
    }
}

public class CreateListRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
