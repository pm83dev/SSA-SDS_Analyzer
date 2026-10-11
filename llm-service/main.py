using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "LLM Service", Version = "v1" });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();

public record AnalyzeRequest(string Prompt, List<ChatMessage>? Messages = null);
public record ChatMessage(string Role, string Content);
public record AnalyzeResponse(string Content, bool? IsExpired = null);

[ApiController]
[Route("api/[controller]")]
public class LlmController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<LlmController> _logger;
    private readonly string _baseUrl;

    public LlmController(IHttpClientFactory clientFactory, IConfiguration config, ILogger<LlmController> logger)
    {
        _httpClient = clientFactory.CreateClient();
        _logger = logger;
        _baseUrl = config["LLM:BaseUrl"] ?? "http://localhost:8080";
    }

    [HttpPost("analyze")]
    public async Task<IActionResult> Analyze([FromBody] AnalyzeRequest request)
    {
        try
        {
            var messages = request.Messages ?? new List<ChatMessage>
            {
                new ChatMessage("system", GetSafetyCardPrompt()),
                new ChatMessage("user", request.Prompt)
            };

            var payload = new
            {
                model = "qwen3.6-35b",
                messages = messages.Select(m => new { role = m.Role, content = m.Content }).ToArray(),
                temperature = 0.1,
                max_tokens = 2000,
                response_format = new { type = "json_object" }
            };

            var response = await _httpClient.PostAsync(
                $"{_baseUrl}/v1/chat/completions",
                new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"));

            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadAsStringAsync();

            var parsed = JsonSerializer.Deserialize<JsonElement>(result);
            var content = parsed.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "";

            return Ok(new AnalyzeResponse { Content = content });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing PDF");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("analyze-upload")]
    public async Task<IActionResult> AnalyzeUpload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Nessun file caricato");

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        var fileBytes = ms.ToArray();

        // TODO: Estrai testo dal PDF e invia al LLM
        _logger.LogInformation("PDF uploaded: {FileName} ({Size} bytes)", file.FileName, fileBytes.Length);

        return Ok(new { message = "Upload ricevuto - elaborazione LLM da implementare" });
    }

    private string GetSafetyCardPrompt()
    {
        return @"Sei un analista di schede di sicurezza. Estrai i dati dal documento e restituisci un JSON con questa struttura:
{
    ""tipologia"": ""string"",
    ""titolo"": ""string"",
    ""numero_protocollo"": ""string"",
    ""ente_emittitore"": ""string"",
    ""data_rilascio"": ""YYYY-MM-DD"",
    ""data_scadenza"": ""YYYY-MM-DD"",
    ""validita_mesi"": number,
    ""stato"": ""Valid|Expiring|Expired"",
    ""frequenza_controllo"": ""string"",
    ""osservazioni"": ""string""
}
Rispondi SOLO con il JSON, senza testo aggiuntivo.";
    }
}
