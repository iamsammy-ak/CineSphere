using CineSphere.Application.Common.Interfaces;
using CineSphere.Application.Features.Posts.Commands.CreateMovieLogPost;
using CineSphere.Application.Features.Posts.Commands.CreateStatusPost;
using CineSphere.Application.Features.Posts.Queries;
using CineSphere.Application.Features.Movies.Queries;
using CineSphere.Application.Features.Reactions.Commands.ToggleReaction;
using CineSphere.Application.Features.Comments.Commands.AddComment;
using CineSphere.Application.Features.Follows.Commands.FollowUser;
using CineSphere.Application.Features.Follows.Queries;
using CineSphere.Domain.Entities;
using CineSphere.Infrastructure.Data;
using CineSphere.Infrastructure.External;
using CineSphere.Api.Services;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// === JWT Auth ===
var jwtKey = builder.Configuration["Jwt:Key"] ?? "CineSphereSuperSecretKeyThatShouldBeAtLeast32Characters!";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "CineSphere.Api",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "CineSphere.Api",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// === DbContext ===
var connString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Host=localhost;Database=cinesphere;Username=postgres;Password=postgres";

builder.Services.AddDbContext<CineSphereDbContext>(options =>
    options.UseNpgsql(connString));

builder.Services.AddDbContext<ApplicationUserDbContext>(options =>
    options.UseNpgsql(connString));

builder.Services.AddIdentityCore<ApplicationUser>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
    .AddEntityFrameworkStores<ApplicationUserDbContext>()
    .AddDefaultTokenProviders();

// === MediatR ===
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetSocialFeedQuery).Assembly));

// === Services ===
builder.Services.AddHttpClient<TmdbService>();
builder.Services.AddScoped<ITmdbService>(sp =>
{
    var httpFactory = sp.GetRequiredService<IHttpClientFactory>();
    var apiKey = sp.GetRequiredService<IConfiguration>()["Tmdb:ApiKey"] ?? "";
    return new TmdbService(httpFactory, apiKey);
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IApplicationDbContext>(sp =>
    sp.GetRequiredService<CineSphereDbContext>());

// === CORS ===
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// === Controllers ===
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// === Middleware ===
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
