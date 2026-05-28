using CineSphere.Application.Common.Models;
using MediatR;

namespace CineSphere.Application.Features.Comments.Commands.AddComment;

public record AddCommentCommand(
    string UserId,
    Guid PostId,
    string Text
) : IRequest<CommentDto>;
