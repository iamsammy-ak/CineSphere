using CineSphere.Application.Common.Models;
using CineSphere.Domain.Enums;
using MediatR;

namespace CineSphere.Application.Features.Reactions.Commands.ToggleReaction;

public record ToggleReactionCommand(
    string UserId,
    Guid PostId,
    ReactionType Type
) : IRequest<ReactionResult>;
