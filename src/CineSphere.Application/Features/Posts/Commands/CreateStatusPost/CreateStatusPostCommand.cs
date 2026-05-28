using CineSphere.Application.Common.Models;
using MediatR;

namespace CineSphere.Application.Features.Posts.Commands.CreateStatusPost;

public record CreateStatusPostCommand(
    string UserId,
    string Content,
    bool IsSpoiler
) : IRequest<PostDto>;
