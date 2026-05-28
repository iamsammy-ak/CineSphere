using CineSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Post> Posts { get; }
    DbSet<MovieLogPost> MovieLogPosts { get; }
    DbSet<StatusPost> StatusPosts { get; }
    DbSet<ListPost> ListPosts { get; }
    DbSet<Comment> Comments { get; }
    DbSet<Reaction> Reactions { get; }
    DbSet<UserFollow> UserFollows { get; }
    DbSet<CustomList> CustomLists { get; }
    DbSet<ApplicationUser> Users { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
