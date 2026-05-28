using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Features.Comments.Commands.AddComment;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSphere.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public CommentsController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpPost]
    public async Task<IActionResult> AddComment([FromBody] AddCommentRequest request)
    {
        var userId = _currentUserService.GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        try
        {
            var command = new AddCommentCommand(userId, request.PostId, request.Text);
            var result = await _mediator.Send(command);
            return Created($"/api/comments/{result.Id}", result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}

public class AddCommentRequest
{
    public Guid PostId { get; set; }
    public string Text { get; set; } = string.Empty;
}
