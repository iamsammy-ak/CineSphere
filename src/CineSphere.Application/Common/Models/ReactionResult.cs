using CineSphere.Domain.Enums;

namespace CineSphere.Application.Common.Models;

public class ReactionResult
{
    public bool IsReacted { get; set; }
    public int TotalReactions { get; set; }
    public ReactionType? CurrentUserReaction { get; set; }
}
