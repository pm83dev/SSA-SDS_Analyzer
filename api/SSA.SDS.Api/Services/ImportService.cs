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
    private readonly IFileStorageService _fileStorage;

    public ImportService(
        SdsDbContext context,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<ImportService> logger,
        IFileStorageService fileStorage)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
        _fileStorage = fileStorage;
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
            var casAboveCol = FindColumn(colMap, "Composizione n. CAS > 0,1%", "Composizione n. CAS");
            var casBelowCol = FindColumn(colMap, "Composizione n. CAS < 0,1%");
            var compositionCol = FindColumn(colMap, "Composizione");
            var diisoCol = FindColumn(colMap, "Diisocianati");
            var physicalStateCol = FindColumn(colMap, "Stato fisico", "stato fisico");
            var boilingPointCol = FindColumn(colMap, "Teb", "teb");
            var vocCol = FindColumn(colMap, "%COV o VOC", "COV", "VOC");
            var densityCol = FindColumn(colMap, "Densità", "densità");
            var sdsCol = FindColumn(colMap, "SDS");
            var sdsDateCol = FindColumn(colMap, "Data SDS", "data sds");

            if (clientIdCol == 0 || nameCol == 0)
            {
                throw new Exception("File non valido: mancano le colonne 'ID CLIENTE' e 'Nome prodotto chimico'");
            }

            var clients = await _context.Clients.ToDictionaryAsync(c => c.Id);
            var seenCards = new HashSet<string>();

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
                if (!seenCards.Add(key))
                {
                    result.Errors++;
                    result.ErrorDetails.Add($"Riga {row}: scheda '{name}' già presente nel file per il cliente {clientId}");
                    continue;
                }

                // Ogni riga del file è la scheda di sicurezza (SDS) di un prodotto chimico
                var card = new SafetyCard
                {
                    ClientId = clientId,
                    Tipologia = "SDS",
                    Titolo = name,
                    EnteEmittitore = Clean(GetCell(sheet, row, producerCol)),
                    DataRilascio = GetDateCell(sheet, row, sdsDateCol),
                    FrasiH = Clean(GetCell(sheet, row, hPhrasesCol)),
                    Pittogrammi = Clean(GetCell(sheet, row, pictogramCol)),
                    ComposizioneCasSopra = Clean(GetCell(sheet, row, casAboveCol)),
                    ComposizioneCasSotto = Clean(GetCell(sheet, row, casBelowCol)),
                    Composizione = Clean(GetCell(sheet, row, compositionCol)),
                    ContieneDiisocianati = ParseYesNo(GetCell(sheet, row, diisoCol))
                        ?? DetectDiisocyanates(
                            GetCell(sheet, row, compositionCol),
                            GetCell(sheet, row, casAboveCol),
                            GetCell(sheet, row, casBelowCol)),
                    StatoFisico = Clean(GetCell(sheet, row, physicalStateCol)),
                    TemperaturaEbollizione = Clean(GetCell(sheet, row, boilingPointCol)),
                    CovPercent = NormalizeCov(Clean(GetCell(sheet, row, vocCol)), Clean(GetCell(sheet, row, densityCol))),
                    Densita = Clean(GetCell(sheet, row, densityCol)),
                    SdsUrl = Clean(GetCell(sheet, row, sdsCol)),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.SafetyCards.Add(card);
                result.CardsImported++;
            }

            await _context.SaveChangesAsync();

            history.ClientId = null;
            history.RecordsImported = result.CardsImported;
            history.Status = result.Errors > 0 && result.CardsImported == 0 ? "Error" : "Success";
            history.ErrorMessage = result.Errors > 0 ? string.Join("; ", result.ErrorDetails.Take(10)) : null;
            await _context.SaveChangesAsync();

            result.HistoryId = history.Id;
            _logger.LogInformation("Import Excel completato: {Cards} schede, {Errors} errori", result.CardsImported, result.Errors);
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

        var clientName = await _context.Clients.Where(c => c.Id == clientId).Select(c => c.RagioneSociale).FirstOrDefaultAsync();
        if (clientName == null)
        {
            result.Message = "Cliente non trovato";
            return result;
        }

        // Il PDF serve due volte: per estrarre il testo e per allegarlo alla scheda
        using var pdfBuffer = new MemoryStream();
        await pdfStream.CopyToAsync(pdfBuffer);

        string text;
        try
        {
            pdfBuffer.Position = 0;
            text = ExtractPdfText(pdfBuffer);
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

        // L'analisi di un PDF SDS crea una scheda di sicurezza (non un prodotto chimico)
        var card = new SafetyCard
        {
            ClientId = clientId,
            Tipologia = "SDS",
            LlmAnalyzed = true,
            LlmRawResponse = json,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        try
        {
            using var doc = System.Text.Json.JsonDocument.Parse(json);
            var root = doc.RootElement;

            card.Titolo = GetJsonString(root, "titolo", "nome_prodotto", "product_name")
                ?? Path.GetFileNameWithoutExtension(fileName)
                ?? "Scheda di sicurezza";
            card.EnteEmittitore = GetJsonString(root, "produttore", "ente_emittitore", "producer");
            card.NumeroProtocollo = GetJsonString(root, "versione", "revisione", "version");
            card.DataRilascio = ParseDate(GetJsonString(root, "data_sds", "data_revisione", "sds_date"));
            card.DataScadenza = ParseDate(GetJsonString(root, "data_scadenza", "expiry_date"));
            card.FrasiH = GetJsonString(root, "frasi_h", "h_phrases");
            card.Pittogrammi = GetJsonString(root, "pittogramma", "pittogrammi", "pictogram");
            card.ComposizioneCasSopra = GetJsonString(root, "composizione_cas_sopra_01", "composition_cas_above");
            card.ComposizioneCasSotto = GetJsonString(root, "composizione_cas_sotto_01", "composition_cas_below");
            card.Composizione = GetJsonString(root, "composizione", "composition");
            card.StatoFisico = GetJsonString(root, "stato_fisico", "physical_state");
            card.TemperaturaEbollizione = GetJsonString(root, "teb", "punto_di_ebollizione", "boiling_point");
            card.Densita = GetJsonString(root, "densita", "density");
            card.CovPercent = NormalizeCov(GetJsonString(root, "cov_percent", "voc_percent", "vocs"), card.Densita);
            card.SdsUrl = GetJsonString(root, "sds_url");
            card.ContieneDiisocianati = ParseYesNo(GetJsonString(root, "diisocianati"))
                ?? DetectDiisocyanates(card.Composizione, card.ComposizioneCasSopra, card.ComposizioneCasSotto);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Errore nel parsing della risposta LLM: {Json}", json);
            result.Message = "La risposta del servizio LLM non è un JSON valido";
            return result;
        }

        if (card.DataScadenza != null)
        {
            var days = (card.DataScadenza.Value.Date - DateTime.Today).Days;
            card.Stato = days < 0 ? "Expired" : days <= 90 ? "Expiring" : "Valid";
            card.DaysRemaining = days;
        }

        _context.SafetyCards.Add(card);
        await _context.SaveChangesAsync();

        // Allega il PDF originale alla scheda (serve l'id della scheda per il percorso)
        try
        {
            pdfBuffer.Position = 0;
            card.PdfUrl = await _fileStorage.SavePdfAsync(clientId, card.Id, pdfBuffer, fileName ?? "sds.pdf");
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Scheda {CardId} creata ma salvataggio PDF fallito", card.Id);
        }

        result.Success = true;
        result.Message = card.PdfUrl != null
            ? $"Scheda \"{card.Titolo}\" creata con PDF allegato"
            : $"Scheda \"{card.Titolo}\" creata (PDF non allegato)";
        result.Card = SafetyCardDto.From(card, clientName);

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
            "\"pittogramma\": \"codici dei pittogrammi (es. GHS02) separati da virgola (punto 2.2): serve il codice GHS, non la descrizione del simbolo\", " +
            "\"composizione_cas_sopra_01\": \"componenti con n. CAS e % > 0,1% (punto 3)\", " +
            "\"composizione_cas_sotto_01\": \"componenti con n. CAS e % < 0,1% (punto 3)\", " +
            "\"composizione\": \"composizione completa del prodotto (punto 3)\", " +
            "\"diisocianati\": \"si se nella composizione ci sono diisocianati (riconoscibili da 'diiso' o 'di-iso' nel nome), altrimenti no\", " +
            "\"stato_fisico\": \"stato fisico (punto 9)\", " +
            "\"teb\": \"temperatura di ebollizione (punto 9)\", " +
            "\"cov_percent\": \"COV/VOC in percentuale (es. 5%). Se la SDS lo riporta in g/l restituisci il valore con l'unità (es. '650 g/l'), verrà convertito. Se non è indicato calcolalo come somma delle % dei componenti organici volatili (solventi) della sezione 3, scrivendo il valore seguito da '(stimato)'\", " +
            "\"densita\": \"densita (punto 9)\", " +
            "\"sds_url\": \"URL o riferimento della SDS se presente, altrimenti null\", " +
            "\"data_sds\": \"data di compilazione/revisione della SDS in formato YYYY-MM-DD, se presente, altrimenti null\", " +
            "\"versione\": \"numero di versione o revisione della SDS, se presente, altrimenti null\", " +
            "\"data_scadenza\": \"data di scadenza/validità della SDS in formato YYYY-MM-DD solo se indicata esplicitamente, altrimenti null\" " +
            "} " +
            "Usa null per i campi non presenti. Non aggiungere testo fuori dal JSON.";

        var payload = new
        {
            model = model,
            messages = new[]
            {
                new { role = "system", content = "Sei un analista di schede di sicurezza (SDS) chimiche. Estrai i dati dal testo fornito e rispondi SEMPRE con un solo oggetto JSON valido, senza testo aggiuntivo." },
                new { role = "user", content = prompt + "\n\nTESTO DELLA SDS:\n" + pdfText }
            },
            temperature = 0.1,
            max_tokens = 2000
        };

        try
        {
            _logger.LogInformation("LLM call: url={Url} model={Model} textLen={Len}", $"{baseUrl}/v1/chat/completions", model, pdfText.Length);
            using var response = await client.PostAsJsonAsync($"{baseUrl}/v1/chat/completions", payload);
            var status = (int)response.StatusCode;
            _logger.LogInformation("LLM response status: {Status}", status);
            if (!response.IsSuccessStatusCode)
            {
                var errBody = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("LLM HTTP {Status}: {Body}", status, errBody);
                return null;
            }

            var body = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("LLM body length: {Len}, preview: {Preview}", body.Length, body.Length > 200 ? body[..200] : body);
            using var doc = System.Text.Json.JsonDocument.Parse(body);
            var content = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
            _logger.LogInformation("LLM content length: {Len}", content?.Length ?? 0);

            var json = ExtractJson(content);
            if (json == null)
            {
                _logger.LogWarning("Nessun JSON trovato nella risposta LLM. Content: {Content}", content);
                return null;
            }

            try
            {
                System.Text.Json.JsonDocument.Parse(json);
                _logger.LogInformation("JSON LLM valid, length: {Len}", json.Length);
                return json;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "JSON LLM non valido: {Json}", json.Length > 500 ? json[..500] : json);
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

    // Cerca prima l'intestazione esatta (a meno di spazi/a capo), poi una che la contiene:
    // così "Composizione" non viene confusa con "Composizione n. CAS > 0,1%"
    private static int FindColumn(Dictionary<string, int> colMap, params string[] candidates)
    {
        static string Normalize(string s) => System.Text.RegularExpressions.Regex.Replace(s, @"\s+", " ").Trim();

        foreach (var candidate in candidates)
        {
            foreach (var (header, col) in colMap)
            {
                if (Normalize(header).Equals(Normalize(candidate), StringComparison.OrdinalIgnoreCase))
                    return col;
            }
        }
        foreach (var candidate in candidates)
        {
            foreach (var (header, col) in colMap)
            {
                if (Normalize(header).Contains(Normalize(candidate), StringComparison.OrdinalIgnoreCase))
                    return col;
            }
        }
        return 0;
    }

    // Il COV va riportato in %: se la SDS lo indica in g/l si converte con COV(g/l) / densità(g/l) * 100
    private static string? NormalizeCov(string? cov, string? densita)
    {
        if (string.IsNullOrWhiteSpace(cov) || !cov.Contains("g/l", StringComparison.OrdinalIgnoreCase))
            return cov;

        var covGl = ParseNumber(cov);
        var density = ParseNumber(densita);
        if (covGl == null || density == null || density <= 0)
            return cov;

        // Densità tipicamente in g/cm³ o kg/l (es. 0,84); se è già in g/l o kg/m³ (es. 840) si usa così
        var densityGl = density < 10 ? density.Value * 1000 : density.Value;
        var percent = covGl.Value / densityGl * 100;
        return $"{percent.ToString("0.##", System.Globalization.CultureInfo.GetCultureInfo("it-IT"))} % (da {cov.Trim()})";
    }

    private static double? ParseNumber(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var match = System.Text.RegularExpressions.Regex.Match(value, @"\d+(?:[.,]\d+)?");
        if (!match.Success) return null;
        return double.TryParse(match.Value.Replace(',', '.'), System.Globalization.NumberStyles.Float,
            System.Globalization.CultureInfo.InvariantCulture, out var n) ? n : null;
    }

    private static bool? ParseYesNo(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var v = value.Trim().ToLowerInvariant();
        if (v is "si" or "sì" or "s" or "x" or "yes" or "y" or "true" or "1") return true;
        if (v is "no" or "n" or "false" or "0") return false;
        return null;
    }

    private static DateTime? GetDateCell(IXLWorksheet sheet, int row, int col)
    {
        if (col == 0) return null;
        var cell = sheet.Cell(row, col);
        if (cell.TryGetValue<DateTime>(out var date)) return date;
        return ParseDate(cell.GetString());
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

    private static DateTime? ParseDate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var formats = new[] { "yyyy-MM-dd", "dd/MM/yyyy", "d/M/yyyy", "dd-MM-yyyy", "dd.MM.yyyy" };
        if (DateTime.TryParseExact(value.Trim(), formats, System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out var exact))
            return exact;
        return DateTime.TryParse(value, System.Globalization.CultureInfo.GetCultureInfo("it-IT"),
            System.Globalization.DateTimeStyles.None, out var parsed) ? parsed : null;
    }

    private static bool? DetectDiisocyanates(params string?[] fields)
    {
        var combined = string.Join(" ", fields.Where(f => !string.IsNullOrWhiteSpace(f)).Select(f => f!.ToLower()));
        // I diisocianati si riconoscono dalla desinenza "diiso" o "di-iso" nella composizione
        if (combined.Contains("diiso") || combined.Contains("di-iso") || combined.Contains("diisocyan"))
            return true;
        return null;
    }
}
