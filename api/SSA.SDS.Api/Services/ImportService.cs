using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using SSA.SDS.Api.Data;
using SSA.SDS.Api.DTOs;
using SSA.SDS.Api.Entities;

namespace SSA.SDS.Api.Services;

public interface IImportService
{
    Task<ImportExcelResultDto> ImportExcelAsync(Stream fileStream, string fileName);
    Task<AnalyzePdfResultDto> AnalyzePdfAsync(Stream pdfStream, int clientId, string? fileName);
}

public class ImportService : IImportService
{
    private readonly SdsDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ImportService> _logger;

    public ImportService(
        SdsDbContext context,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<ImportService> logger)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<ImportExcelResultDto> ImportExcelAsync(Stream fileStream, string fileName)
    {
        var result = new ImportExcelResultDto { Status = "Success" };
        ImportHistory? history = null;

        try
        {
            history = new ImportHistory
            {
                FileName = fileName,
                FileType = "Excel",
                Status = "Processing",
                CreatedAt = DateTime.UtcNow
            };
            _context.ImportHistories.Add(history);
            await _context.SaveChangesAsync();

            var workbook = new XLWorkbook(fileStream);
            var sheet = workbook.Worksheets.First();

            var colMap = new Dictionary<string, int>();
            for (var col = 1; col <= sheet.ColumnsUsed().Count(); col++)
            {
                var header = sheet.Cell(1, col).GetString().Trim();
                if (!string.IsNullOrEmpty(header))
                    colMap[header] = col;
            }

            var clientIdCol = FindColumn(colMap, "ID CLIENTE", "id cliente", "ID cliente");
            var nameCol = FindColumn(colMap, "Nome prodotto chimico", "nome prodotto");
            var producerCol = FindColumn(colMap, "Produttore", "produttore");
            var hPhrasesCol = FindColumn(colMap, "Frasi H", "frasi h");
            var pictogramCol = FindColumn(colMap, "Pittogramma", "pittogrammi", "pittogrammi");
            var casAboveCol = FindColumn(colMap, "Composizione n. CAS");
            var compositionCol = FindColumn(colMap, "Composizione", "composizione");
            var physicalStateCol = FindColumn(colMap, "Stato fisico", "stato fisico");
            var boilingPointCol = FindColumn(colMap, "Teb", "teb");
            var vocCol = FindColumn(colMap, "COV", "VOC");
            var densityCol = FindColumn(colMap, "Densità", "densità");
            var sdsCol = FindColumn(colMap, "SDS");
            var sdsDateCol = FindColumn(colMap, "Data SDS", "data sds");

            if (clientIdCol == 0 || nameCol == 0)
            {
                throw new Exception("File non valido: mancano le colonne 'ID CLIENTE' e 'Nome prodotto chimico'");
            }

            var clients = await _context.Clients.ToDictionaryAsync(c => c.Id);
            var seenProducts = new HashSet<string>();

            for (var row = 2; row <= sheet.RowsUsed().Count(); row++)
            {
                var name = sheet.Cell(row, nameCol).GetString().Trim();
                if (string.IsNullOrEmpty(name)) continue;

                var clientId = int.TryParse(sheet.Cell(row, clientIdCol).GetString().Trim(), out var cid) ? cid : 0;
                if (clientId == 0 || !clients.ContainsKey(clientId))
                {
                    result.Errors++;
                    result.ErrorDetails.Add($"Riga {row}: ID cliente '{sheet.Cell(row, clientIdCol).GetString().Trim()}' non trovato nella tabella clienti");
                    continue;
                }

                var key = $"{clientId}|{name.ToLower()}";
                if (!seenProducts.Add(key))
                {
                    result.Errors++;
                    result.ErrorDetails.Add($"Riga {row}: prodotto '{name}' già importato per il cliente {clientId}");
                    continue;
                }

                var sdsDate = sheet.Cell(row, sdsDateCol).GetValue<DateTime?>();
                var hasDiiso = DetectDiisocyanates(
                    GetCell(sheet, row, compositionCol),
                    GetCell(sheet, row, casAboveCol));

                var product = new ChemicalProduct
                {
                    ClientId = clientId,
                    ProductName = name,
                    Producer = Clean(GetCell(sheet, row, producerCol)),
                    HPhrases = Clean(GetCell(sheet, row, hPhrasesCol)),
                    Pictogram = Clean(GetCell(sheet, row, pictogramCol)),
                    CompositionCasAbove = Clean(GetCell(sheet, row, casAboveCol)),
                    Composition = Clean(GetCell(sheet, row, compositionCol)),
                    HasDiisocyanates = hasDiiso,
                    PhysicalState = Clean(GetCell(sheet, row, physicalStateCol)),
                    BoilingPoint = Clean(GetCell(sheet, row, boilingPointCol)),
                    VocPercent = Clean(GetCell(sheet, row, vocCol)),
                    Density = Clean(GetCell(sheet, row, densityCol)),
                    SdsUrl = Clean(GetCell(sheet, row, sdsCol)),
                    SdsDate = sdsDate,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.ChemicalProducts.Add(product);
                result.ProductsImported++;
            }

            await _context.SaveChangesAsync();

            history.ClientId = null;
            history.RecordsImported = result.ProductsImported;
            history.Status = result.Errors > 0 && result.ProductsImported == 0 ? "Error" : "Success";
            history.ErrorMessage = result.Errors > 0 ? string.Join("; ", result.ErrorDetails.Take(10)) : null;
            await _context.SaveChangesAsync();

            result.HistoryId = history.Id;
            _logger.LogInformation("Import Excel completato: {Products} prodotti, {Errors} errori", result.ProductsImported, result.Errors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Errore durante l'importazione Excel {FileName}", fileName);
            result.Status = "Error";
            result.ErrorDetails.Add(ex.Message);

            if (history != null)
            {
                history.Status = "Error";
                history.ErrorMessage = ex.Message;
                await _context.SaveChangesAsync();
                result.HistoryId = history.Id;
            }
        }

        return result;
    }

    public async Task<AnalyzePdfResultDto> AnalyzePdfAsync(Stream pdfStream, int clientId, string? fileName)
    {
        var result = new AnalyzePdfResultDto { Success = false };

        if (!await _context.Clients.AnyAsync(c => c.Id == clientId))
        {
            result.Message = "Cliente non trovato";
            return result;
        }

        string text;
        try
        {
            text = ExtractPdfText(pdfStream);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Errore nell'estrazione del testo PDF {FileName}", fileName);
            result.Message = "Impossibile estrarre il testo dal PDF (file non testuale o corrotto)";
            return result;
        }

        if (string.IsNullOrWhiteSpace(text))
        {
            result.Message = "Il PDF non contiene testo estraibile (probabilmente è una scansione)";
            return result;
        }

        var truncated = text.Length > 20000 ? text[..20000] : text;
        var json = await CallLlmAsync(truncated);
        if (json == null)
        {
            result.Message = "Il servizio LLM non ha restituito una risposta valida. Verifica che il server LLM sia raggiungibile.";
            return result;
        }

        var product = new ChemicalProduct
        {
            ClientId = clientId,
            ProductName = string.Empty,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        try
        {
            using var doc = System.Text.Json.JsonDocument.Parse(json);
            var root = doc.RootElement;

            product.ProductName = GetJsonString(root, "titolo", "nome_prodotto", "product_name") ?? "Prodotto sconosciuto";
            product.Producer = GetJsonString(root, "produttore", "ente_emittitore", "producer");
            product.HPhrases = GetJsonString(root, "frasi_h", "h_phrases");
            product.Pictogram = GetJsonString(root, "pittogramma", "pictogram");
            product.CompositionCasAbove = GetJsonString(root, "composizione_cas_sopra_01", "composition_cas_above");
            product.CompositionCasBelow = GetJsonString(root, "composizione_cas_sotto_01", "composition_cas_below");
            product.Composition = GetJsonString(root, "composizione", "composition");
            product.PhysicalState = GetJsonString(root, "stato_fisico", "physical_state");
            product.BoilingPoint = GetJsonString(root, "teb", "punto_di_ebollizione", "boiling_point");
            product.VocPercent = GetJsonString(root, "cov_percent", "voc_percent", "vocs");
            product.Density = GetJsonString(root, "densita", "density");
            product.SdsUrl = GetJsonString(root, "sds_url");
            product.HasDiisocyanates = DetectDiisocyanates(product.Composition, product.CompositionCasAbove);

            var sdsDateStr = GetJsonString(root, "data_sds", "sds_date");
            if (!string.IsNullOrEmpty(sdsDateStr) && DateTime.TryParse(sdsDateStr, out var sdsDate))
                product.SdsDate = sdsDate;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Errore nel parsing della risposta LLM: {Json}", json);
            result.Message = "La risposta del servizio LLM non è un JSON valido";
            return result;
        }

        _context.ChemicalProducts.Add(product);
        await _context.SaveChangesAsync();

        result.Success = true;
        result.Message = "Scheda analizzata e prodotto creato con successo";
        result.Product = MapProduct(product);

        var history = new ImportHistory
        {
            FileName = fileName ?? "pdf-llm",
            FileType = "Pdf",
            ClientId = clientId,
            RecordsImported = 1,
            Status = "Success",
            CreatedAt = DateTime.UtcNow
        };
        _context.ImportHistories.Add(history);
        await _context.SaveChangesAsync();

        return result;
    }

    private string ExtractPdfText(Stream pdfStream)
    {
        using var ms = new MemoryStream();
        pdfStream.CopyTo(ms);
        ms.Position = 0;
        using var doc = UglyToad.PdfPig.PdfDocument.Open(ms);
        var pages = doc.GetPages();
        return string.Join("\n", pages.Select(p => p.Text));
    }

    private async Task<string?> CallLlmAsync(string pdfText)
    {
        var baseUrl = _configuration["LLM:BaseUrl"] ?? "http://localhost:8000";
        var model = _configuration["LLM:Model"] ?? "hexagon";
        var apiKey = _configuration["LLM:ApiKey"];
        var timeout = int.TryParse(_configuration["LLM:TimeoutSeconds"], out var t) ? t : 300;
        var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(timeout);
        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
        }

        var prompt = "Sei un analista di schede di sicurezza (SDS) chimiche. Dal testo della SDS estrai i dati e restituisci SOLO un JSON valido con questa struttura: " +
            "{ " +
            "\"titolo\": \"nome del prodotto chimico (punto 1.1)\", " +
            "\"produttore\": \"produttore/distributore (punto 1.3)\", " +
            "\"frasi_h\": \"codici delle frasi H (es. H225, H315) separate da virgola (punto 2.1)\", " +
            "\"pittogramma\": \"codici dei pittogrammi (es. GHS02) separati da virgola (punto 2.2)\", " +
            "\"composizione_cas_sopra_01\": \"componenti con n. CAS e % > 0,1% (punto 3)\", " +
            "\"composizione_cas_sotto_01\": \"componenti con n. CAS e % < 0,1% (punto 3)\", " +
            "\"composizione\": \"composizione completa del prodotto (punto 3)\", " +
            "\"stato_fisico\": \"stato fisico (punto 9)\", " +
            "\"teb\": \"temperatura di ebollizione (punto 9)\", " +
            "\"cov_percent\": \"percentuale di COV/VOC (es. 5%)\", " +
            "\"densita\": \"densita (punto 9)\", " +
            "\"sds_url\": \"URL o riferimento della SDS se presente, altrimenti null\", " +
            "\"data_sds\": \"data della SDS in formato YYYY-MM-DD, se presente, altrimenti null\" " +
            "} " +
            "Usa null per i campi non presenti. Non aggiungere testo fuori dal JSON.";

        var payload = new
        {
            model = model,
            messages = new[]
            {
                new { role = "system", content = "Sei un assistente che estrae dati strutturati da schede di sicurezza chimiche. Rispondi sempre con un solo oggetto JSON valido." },
                new { role = "user", content = "Estrai i dati dalla seguente SDS:\n\n" + pdfText }
            },
            temperature = 0.1,
            max_tokens = 2000
        };

        try
        {
            using var response = await client.PostAsJsonAsync($"{baseUrl}/v1/chat/completions", payload);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("LLM HTTP {Status}: {Body}", (int)response.StatusCode, await response.Content.ReadAsStringAsync());
                return null;
            }

            var body = await response.Content.ReadAsStringAsync();
            using var doc = System.Text.Json.JsonDocument.Parse(body);
            var content = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

            var json = ExtractJson(content);
            if (json == null)
                return null;

            try
            {
                System.Text.Json.JsonDocument.Parse(json);
                return json;
            }
            catch
            {
                return null;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Errore nella chiamata al servizio LLM {Url}", baseUrl);
            return null;
        }
    }

    private static string? ExtractJson(string? content)
    {
        if (string.IsNullOrWhiteSpace(content)) return null;
        var start = content.IndexOf('{');
        var end = content.LastIndexOf('}');
        if (start >= 0 && end > start)
            return content[start..(end + 1)];
        return null;
    }

    private static string? GetJsonString(System.Text.Json.JsonElement root, params string[] names)
    {
        foreach (var name in names)
        {
            if (root.TryGetProperty(name, out var el))
            {
                if (el.ValueKind == System.Text.Json.JsonValueKind.Null) return null;
                var value = el.ValueKind == System.Text.Json.JsonValueKind.String ? el.GetString() : el.GetRawText();
                if (!string.IsNullOrWhiteSpace(value) && value != "null")
                    return value;
                return null;
            }
        }
        return null;
    }

    private static int FindColumn(Dictionary<string, int> colMap, params string[] candidates)
    {
        foreach (var candidate in candidates)
        {
            foreach (var (header, col) in colMap)
            {
                if (header.Contains(candidate, StringComparison.OrdinalIgnoreCase))
                    return col;
            }
        }
        return 0;
    }

    private static string GetCell(IXLWorksheet sheet, int row, int col)
    {
        if (col == 0) return string.Empty;
        return sheet.Cell(row, col).GetString().Trim();
    }

    private static string? Clean(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var cleaned = value.Replace("si trova al punto", "").Trim();
        return cleaned.Length > 0 ? cleaned : null;
    }

    private static bool? DetectDiisocyanates(params string?[] fields)
    {
        var combined = string.Join(" ", fields.Where(f => !string.IsNullOrWhiteSpace(f)).Select(f => f!.ToLower()));
        if (combined.Contains("diisocianat") || combined.Contains("diiso"))
            return true;
        return null;
    }

    private ChemicalProductDto MapProduct(ChemicalProduct p) => new()
    {
        Id = p.Id,
        ClientId = p.ClientId,
        ClientName = p.Client?.RagioneSociale ?? string.Empty,
        ProductName = p.ProductName,
        Producer = p.Producer,
        HPhrases = p.HPhrases,
        Pictogram = p.Pictogram,
        CompositionCasAbove = p.CompositionCasAbove,
        CompositionCasBelow = p.CompositionCasBelow,
        Composition = p.Composition,
        HasDiisocyanates = p.HasDiisocyanates,
        PhysicalState = p.PhysicalState,
        BoilingPoint = p.BoilingPoint,
        VocPercent = p.VocPercent,
        Density = p.Density,
        SdsUrl = p.SdsUrl,
        SdsDate = p.SdsDate,
        CreatedAt = p.CreatedAt,
        UpdatedAt = p.UpdatedAt
    };
}
