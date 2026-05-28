using MediatR;

namespace CineSphere.Application.Features.Follows.Commands.FollowUser;

public record FollowUserCommand(string FollowerId, string FolloweeId) : IRequest<bool>;
