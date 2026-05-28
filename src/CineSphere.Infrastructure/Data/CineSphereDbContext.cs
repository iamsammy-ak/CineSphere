using CineSphere.Application.Common.Interfaces;
using CineSphere.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Infrastructure.Data;

public class CineSphereDbContext : DbContext, IApplicationDbContext
{
    public CineSphereDbContext(DbContextOptions<CineSphereDbContext> options) : base(options) { }

    public DbSet<Post> Posts => Set<Post>();
    public DbSet<MovieLogPost> MovieLogPosts => Set<MovieLogPost>();
    public DbSet<StatusPost> StatusPosts => Set<StatusPost>();
    public DbSet<ListPost> ListPosts => Set<ListPost>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Reaction> Reactions => Set<Reaction>();
    public DbSet<UserFollow> UserFollows => Set<UserFollow>();
    public DbSet<CustomList> CustomLists => Set<CustomList>();
    public DbSet<ApplicationUser> Users => Set<ApplicationUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // === Post Inheritance (TPH - Table Per Hierarchy) ===
        modelBuilder.Entity<Post>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.HasIndex(p => p.UserId);
            entity.HasIndex(p => p.CreatedAt);
            entity.Property(p => p.Content).HasMaxLength(4000);

            entity.HasOne(p => p.User)
                .WithMany(u => u.Posts)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasDiscriminator<string>("PostType")
                .HasValue<MovieLogPost>("MovieLog")
                .HasValue<StatusPost>("Status")
                .HasValue<ListPost>("List");
        });

        modelBuilder.Entity<MovieLogPost>(entity =>
        {
            entity.Property(mlp => mlp.Rating).HasPrecision(3, 1);
            entity.Ignore(mlp => mlp.Movie);
        });

        modelBuilder.Entity<StatusPost>(entity => { });

        modelBuilder.Entity<ListPost>(entity =>
        {
            entity.HasOne(lp => lp.List)
                .WithMany(cl => cl.ListPosts)
                .HasForeignKey(lp => lp.ListId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CustomList>(entity =>
        {
            entity.HasKey(cl => cl.Id);
            entity.Property(cl => cl.Name).HasMaxLength(200).IsRequired();
            entity.Property(cl => cl.Description).HasMaxLength(1000);
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.HasIndex(c => c.PostId);
            entity.Property(c => c.Text).HasMaxLength(2000).IsRequired();

            entity.HasOne(c => c.Post)
                .WithMany(p => p.Comments)
                .HasForeignKey(c => c.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Reaction>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.HasIndex(r => new { r.PostId, r.UserId }).IsUnique();

            entity.HasOne(r => r.Post)
                .WithMany(p => p.Reactions)
                .HasForeignKey(r => r.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.User)
                .WithMany(u => u.Reactions)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserFollow>(entity =>
        {
            entity.HasKey(uf => new { uf.FollowerId, uf.FolloweeId });

            entity.HasOne(uf => uf.Follower)
                .WithMany(u => u.FollowersNavigation)
                .HasForeignKey(uf => uf.FollowerId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(uf => uf.Followee)
                .WithMany(u => u.FollowingNavigation)
                .HasForeignKey(uf => uf.FolloweeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(u => u.DisplayName).HasMaxLength(100);
            entity.Property(u => u.Bio).HasMaxLength(500);
            entity.Property(u => u.AvatarUrl).HasMaxLength(500);
        });
    }
}
