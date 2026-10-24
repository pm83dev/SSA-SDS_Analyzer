using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SSA.SDS.Api.Data;
using SSA.SDS.Api.Services;
using System.Text.Json;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=localhost;Database=sds_db;Integrated Security=true;Trust Server Certificate=true";

builder.Services.AddDbContext<SdsDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
});

var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"] ?? "SSA-SDS-SecretKey-2024-MustBeAtLeast32CharsLong!";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "SSA-SDS",
        ValidAudience = jwtSettings["Audience"] ?? "SSA-SDS-Client",
        IssuerSigningKey = new SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "SSA-SDS API",
        Version = "v1",
        Description = "API per la gestione delle Schede di Sicurezza e dei Prodotti Chimici"
    });

    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Inserisci 'Bearer' seguito da spazio e il tuo token JWT"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddHttpClient();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IImportService, ImportService>();
builder.Services.AddScoped<IExpirationService, ExpirationService>();
builder.Services.AddSingleton<IFileStorageService, FileStorageService>();
builder.Services.AddHostedService<ExpirationWorker>();

// Use Serilog as the application logging provider (console + rolling file logs).
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File(
        path: "logs/api-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 14,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}"));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // Swagger sotto /api/swagger così non entra in conflitto con le route della SPA
    app.UseSwagger(c => c.RouteTemplate = "api/swagger/{documentName}/swagger.json");
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/api/swagger/v1/swagger.json", "SSA-SDS API V1");
        c.RoutePrefix = "api/swagger";
    });
}

// Serve Angular frontend (wwwroot) as static files
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        // I bundle di produzione hanno l'hash nel nome (main-ABCD1234.js): si possono mettere in cache a lungo.
        // index.html e i bundle di sviluppo senza hash (main.js) non vanno in cache,
        // altrimenti dopo un deploy o una build il browser usa file vecchi.
        var headers = ctx.Context.Response.Headers;
        if (HashedAssetName().IsMatch(ctx.File.Name))
            headers.CacheControl = "public, max-age=31536000, immutable";
        else
            headers.CacheControl = "no-cache";
    }
});

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// Map API controllers (they already have /api prefix in their Route attribute)
app.MapControllers();

// Le route /api sconosciute devono restituire 404, non la pagina della SPA
app.MapFallback("/api/{**path}", () => Results.NotFound(new { message = "Endpoint non trovato" }));

// Fallback to index.html for Angular routing (SPA): deep link come /clients/1 funzionano al refresh
app.MapFallbackToFile("index.html", new StaticFileOptions
{
    OnPrepareResponse = ctx => ctx.Context.Response.Headers.CacheControl = "no-cache, no-store, must-revalidate"
});

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<SdsDbContext>();
    dbContext.Database.Migrate();
    var seedService = new SeedService(dbContext);
    await seedService.SeedDefaultAdminAsync();

    var expiration = scope.ServiceProvider.GetRequiredService<IExpirationService>();
    await expiration.RecalculateCardStatusesAsync();
    await expiration.GenerateNotificationsAsync();
}

app.Run();

public partial class Program
{
    // Nome di un bundle Angular di produzione con hash, es. main-4SWC56EF.js / styles-EGL6PHTI.css
    [System.Text.RegularExpressions.GeneratedRegex(@"-[A-Z0-9]{8}\.(js|css)$")]
    private static partial System.Text.RegularExpressions.Regex HashedAssetName();
}
