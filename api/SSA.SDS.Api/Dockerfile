FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["SSA.SDS.Api.csproj", "./"]
COPY ["SSA.SDS.Domain/SSA.SDS.Domain.csproj", "SSA.SDS.Domain/"]
COPY ["SSA.SDS.Application/SSA.SDS.Application.csproj", "SSA.SDS.Application/"]
COPY ["SSA.SDS.Infrastructure/SSA.SDS.Infrastructure.csproj", "SSA.SDS.Infrastructure/"]

RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app .

RUN mkdir -p /app/uploads /app/logs

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "SSA.SDS.Api.dll"]
