using CineSphere.Application.Common.Interfaces;
using CineSphere.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CineSphere.Application.Features.CustomLists.Commands;

public record CreateCustomListCommand(
    string UserId,
    string Name,
    string? Description
) : IRequest<CustomListDto>;

public class CreateCustomListCommandHandler : IRequestHandler<CreateCustomListCommand, CustomListDto>
{
    private readonly IApplicationDbContext _context;

    public CreateCustomListCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CustomListDto> Handle(CreateCustomListCommand request, CancellationToken cancellationToken)
    {
        var list = new CustomList
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Name = request.Name,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow
        };

        _context.CustomLists.Add(list);
        await _context.SaveChangesAsync(cancellationToken);

        return new CustomListDto
        {
            Id = list.Id,
            Name = list.Name,
            Description = list.Description,
            UserId = list.UserId,
            CreatedAt = list.CreatedAt,
            PostCount = 0
        };
    }
}

public class CustomListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int PostCount { get; set; }
}
