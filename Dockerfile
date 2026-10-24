# Stage 1: Build Angular Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/sds-frontend/package*.json ./
RUN npm ci
COPY frontend/sds-frontend/ .
RUN npm run build -- --configuration production

# Stage 2: Build .NET API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src
COPY api/SSA.SDS.Api/ ./
RUN dotnet restore
RUN dotnet build -c Release -o /app
# Copy Angular build to API wwwroot
COPY --from=frontend-build /app/dist/sds-frontend/browser/ /app/wwwroot/

# Stage 3: Final Image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=backend-build /app .

RUN mkdir -p /app/uploads /app/logs

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "SSA.SDS.Api.dll"]