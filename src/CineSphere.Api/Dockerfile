FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS api-base
WORKDIR /app
COPY src/CineSphere.Api/ ./CineSphere.Api/
COPY src/CineSphere.Application/ ./CineSphere.Application/
COPY src/CineSphere.Domain/ ./CineSphere.Domain/
COPY src/CineSphere.Infrastructure/ ./CineSphere.Infrastructure/
RUN dotnet restore src/CineSphere.Api/CineSphere.Api.csproj
RUN dotnet build src/CineSphere.Api/CineSphere.Api.csproj -c Release -o /app/out
EXPOSE 5001
CMD ["dotnet", "out/CineSphere.Api.dll", "--urls", "http://0.0.0.0:5001"]
