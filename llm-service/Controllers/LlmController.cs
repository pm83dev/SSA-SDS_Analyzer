using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SSA.LlmService.Models;

namespace SSA.LlmService;

public class LlmController : ControllerBase
{
    private readonly LlmOptions _options;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<LlmController> _logger;
    private readonly ApplicationDbContext _context;

    public LlmController(IConfiguration configuration, IHttpClientFactory httpClientFactory, ILogger<LlmController> logger, ApplicationDbContext context)
    {
        _options = configuration.Get<LlmOptions>() ?? new LlmOptions();
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _context = context;
    }

    [HttpPost("analyze")]
    public async Task<IActionResult> Analyze([FromBody] AnalyzeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
            return BadRequest(new { message = "Il testo del documento non è vuoto" });

        var content = await CallLlmAsync(request.Text);
        if (content == null)
            return StatusCode(502, new { error = "Il server LLM non ha restituito una risposta valida" });

        // Parse JSON and save to database
        try
        {
            var extractedData = JsonSerializer.Deserialize<SafetyDataSheet>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            
            if (extractedData != null)
            {
                // Set additional fields
                extractedData.CreatedAt = DateTime.UtcNow;
                
                _context.SafetyDataSheets.Add(extractedData);
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Errore nel salvataggio dei dati estratti");
            // Don't fail the API call if database saving fails
        }

        return Ok(new AnalyzeResponse { Content = content });
    }

    private async Task<string?> CallLlmAsync(string text)
    {
        var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds);

        var payload = new
        {
            model = _options.Model,
            messages = new[]
            {
                new { role = "system", content = "Sei un assistente che estrae dati strutturati da schede di sicurezza chimiche. Rispondi sempre con un solo oggetto JSON valido." },
                new { role = "user", content = $"Estrai i dati dalla seguente SDS e restituisci SOLO un JSON valido con questa struttura:\n{{ \"titolo\": \"nome del prodotto chimico (punto 1.1)\", \"produttore\": \"produttore/distributore (punto 1.3)\", \"frasi_h\": \"codici delle frasi H (es. H225, H315) separate da virgola (punto 2.1)\", \"pittogramma\": \"codici dei pittogrammi (es. GHS02) separati da virgola (punto 2.2)\", \"composizione_cas_sopra_01\": \"componenti con n. CAS e % > 0,1% (punto 3)\", \"composizione_cas_sotto_01\": \"componenti con n. CAS e % < 0,1% (punto 3)\", \"composizione\": \"composizione completa del prodotto (punto 3)\", \"stato_fisico\": \"stato fisico (punto 9)\", \"teb\": \"temperatura di ebollizione (punto 9)\", \"cov_percent\": \"percentuale di COV/VOC (es. 5%)\", \"densita\": \"densita (punto 9)\", \"sds_url\": \"URL o riferimento della SDS se presente, altrimenti null\", \"data_sds\": \"data della SDS in formato YYYY-MM-DD, se presente, altrimenti null\" }}\nUsa null per i campi non presenti. Non aggiungere testo fuori dal JSON.\n\n{Truncate(text)}" }
            },
            temperature = 0.1,
            max_tokens = 2000
        };

        try
        {
            using var response = await client.PostAsJsonAsync($"{_options.BaseUrl.TrimEnd('/')}/v1/chat/completions", payload);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("LLM HTTP {Status}: {Body}", (int)response.StatusCode, await response.Content.ReadAsStringAsync());
                return null;
            }

            var body = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(body);
            var content = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

            var json = ExtractJson(content);
            if (json == null)
                return null;

            try
            {
                JsonDocument.Parse(json);
                return json;
            }
            catch
            {
                return null;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Errore nella chiamata al server LLM {Url}", _options.BaseUrl);
            return null;
        }
    }

    private static string Truncate(string text)
        => text.Length > 20000 ? text[..20000] : text;

    private static string? ExtractJson(string? content)
    {
        if (string.IsNullOrWhiteSpace(content)) return null;
        var start = content.IndexOf('{');
        var end = content.LastIndexOf('}');
        if (start >= 0 && end > start)
            return content[start..(end + 1)];
        return null;
    }
}

public class LlmOptions
{
    public string BaseUrl { get; set; } = "http://localhost:8080";
    public string Model { get; set; } = "local-model";
    public int TimeoutSeconds { get; set; } = 300;
}

public class AnalyzeRequest
{
    public string Text { get; set; } = string.Empty;
}

public class AnalyzeResponse
{
    public string Content { get; set; } = string.Empty;
}
