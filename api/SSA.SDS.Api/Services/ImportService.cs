using System.Security.Cryptography;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using SSA.SDS.Api.Data;
using SSA.SDS.Api.DTOs;
using SSA.SDS.Api.Entities;

namespace SSA.SDS.Api.Services;

public interface IImportService
{
    Task<ImportExcelResultDto> ImportExcelAsync(Stream fileStream, string fileName);
    Task<AnalyzePdfResultDto> AnalyzePdfAsync(Stream pdfStream, int? clientId, string? fileName);
}

public class ImportService : IImportService
{
    private readonly SdsDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ImportService> _logger;
    private readonly IFileStorageService _fileStorage;
    private readonly IOcrService _ocr;
    private readonly Lazy<GhsPictogramMatcher> _ghsMatcher;

    public ImportService(
        SdsDbContext context,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<ImportService> logger,
        IFileStorageService fileStorage,
        IOcrService ocr)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
        _fileStorage = fileStorage;
        _ocr = ocr;
        // Le 9 immagini di riferimento sono quelle ritagliate dal foglio "Pittogrammi"
        // dell'Excel, le stesse servite dal frontend (wwwroot/ghs)
        _ghsMatcher = new Lazy<GhsPictogramMatcher>(() =>
        {
            var ghsFolder = Path.Combine(AppContext.BaseDirectory, "wwwroot", "ghs");
            return GhsPictogramMatcher.FromDirectory(ghsFolder);
        });
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
            // Stesso prodotto (nome + produttore) per più clienti: una sola scheda collegata a tutti
            var cardsByKey = (await _context.SafetyCards.Include(sc => sc.Clients).ToListAsync())
                .GroupBy(sc => CardKey(sc.Titolo, sc.EnteEmittitore))
                .ToDictionary(g => g.Key, g => g.First());

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

                var key = CardKey(name, Clean(GetCell(sheet, row, producerCol)));
                if (cardsByKey.TryGetValue(key, out var existing))
                {
                    if (existing.Clients.Any(c => c.Id == clientId))
                    {
                        result.Errors++;
                        result.ErrorDetails.Add($"Riga {row}: scheda '{name}' già collegata al cliente {clientId}");
                    }
                    else
                    {
                        existing.Clients.Add(clients[clientId]);
                        result.LinksAdded++;
                    }
                    continue;
                }

                // Ogni riga del file è la scheda di sicurezza (SDS) di un prodotto chimico
                var card = new SafetyCard
                {
                    Tipologia = "SDS",
                    Titolo = name,
                    NomeFileImportato = fileName,
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

                card.Clients.Add(clients[clientId]);
                _context.SafetyCards.Add(card);
                cardsByKey[key] = card;
                result.CardsImported++;
            }

            await _context.SaveChangesAsync();

            history.ClientId = null;
            history.RecordsImported = result.CardsImported + result.LinksAdded;
            history.Status = result.Errors > 0 && result.CardsImported + result.LinksAdded == 0 ? "Error" : "Success";
            history.ErrorMessage = result.Errors > 0 ? string.Join("; ", result.ErrorDetails.Take(10)) : null;
            await _context.SaveChangesAsync();

            result.HistoryId = history.Id;
            _logger.LogInformation("Import Excel completato: {Cards} schede nuove, {Links} collegamenti a schede esistenti, {Errors} errori",
                result.CardsImported, result.LinksAdded, result.Errors);
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

    // clientId facoltativo: senza cliente la scheda resta solo nell'archivio
    public async Task<AnalyzePdfResultDto> AnalyzePdfAsync(Stream pdfStream, int? clientId, string? fileName)
    {
        var result = new AnalyzePdfResultDto { Success = false };

        Client? client = null;
        if (clientId != null)
        {
            client = await _context.Clients.FindAsync(clientId.Value);
            if (client == null)
            {
                result.Message = "Cliente non trovato";
                return result;
            }
        }

        // Il PDF serve due volte: per estrarre il testo e per allegarlo alla scheda
        using var pdfBuffer = new MemoryStream();
        await pdfStream.CopyToAsync(pdfBuffer);

        // Lo stesso PDF già importato (anche per un altro cliente): si collega la scheda esistente, senza rianalizzarlo
        var pdfHash = Convert.ToHexString(SHA256.HashData(pdfBuffer.ToArray()));
        var existing = await FindCardByPdfHashAsync(pdfHash);
        if (existing != null)
        {
            var linked = client != null && !existing.Clients.Any(c => c.Id == client.Id);
            if (linked) existing.Clients.Add(client!);
            _context.ImportHistories.Add(new ImportHistory
            {
                FileName = fileName ?? "pdf-llm",
                FileType = "Pdf",
                ClientId = clientId,
                RecordsImported = linked ? 1 : 0,
                Status = "Success",
                CreatedAt = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            result.Success = true;
            result.AlreadyExisting = true;
            result.Message = client == null
                ? $"PDF già presente nell'archivio: scheda \"{existing.Titolo}\""
                : linked
                    ? $"PDF già presente nell'archivio: scheda \"{existing.Titolo}\" collegata a {client.RagioneSociale}"
                    : $"PDF già presente: la scheda \"{existing.Titolo}\" è già collegata a {client.RagioneSociale}";
            result.Card = SafetyCardDto.From(existing);
            return result;
        }

        string text;
        var ocrUsed = false;
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
            // PDF scansionato: nessun testo estraibile. Si prova a leggerlo con OCR,
            // sapendo che i caratteri riconosciuti possono avere errori e vanno controllati
            if (_ocr.IsAvailable)
            {
                try
                {
                    pdfBuffer.Position = 0;
                    text = OcrPdfPages(pdfBuffer.ToArray(), fileName);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Errore OCR sul PDF {FileName}", fileName);
                }
            }

            if (string.IsNullOrWhiteSpace(text))
            {
                result.Message = _ocr.IsAvailable
                    ? "Il PDF non contiene testo estraibile e l'OCR non ha letto nulla di leggibile"
                    : "Il PDF non contiene testo estraibile (probabilmente è una scansione) e l'OCR non è disponibile: " +
                      (_ocr.UnavailableReason ?? "verifica i file lingua in tessdata");
                return result;
            }

            ocrUsed = true;
            _logger.LogInformation("PDF {FileName} senza testo: testo letto con OCR ({Chars} caratteri)", fileName, text.Length);
        }

        // Quanto testo inviare all'LLM: i dati oltre il limite non vengono letti (e quindi non verificabili)
        var maxChars = int.TryParse(_configuration["LLM:MaxTextChars"], out var mc) && mc > 0 ? mc : 20000;
        var truncated = text.Length > maxChars ? text[..maxChars] : text;
        var json = await CallLlmAsync(truncated);
        if (json == null)
        {
            result.Message = "Il servizio LLM non ha restituito una risposta valida. Verifica che il server LLM sia raggiungibile.";
            return result;
        }

        // L'analisi di un PDF SDS crea una scheda di sicurezza (non un prodotto chimico)
        var card = new SafetyCard
        {
            Tipologia = "SDS",
            NomeFileImportato = fileName,
            PdfHash = pdfHash,
            LlmAnalyzed = true,
            LlmRawResponse = json,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        bool? llmDiisocianati = null;
        try
        {
            using var doc = System.Text.Json.JsonDocument.Parse(json);
            var root = doc.RootElement;

            // Se manca il nome, SdsVerifier mette il nome del file come segnaposto e lo segnala
            card.Titolo = GetJsonString(root, "titolo", "nome_prodotto", "product_name") ?? string.Empty;
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
            card.CovPercent = GetJsonString(root, "cov_percent", "voc_percent", "vocs");
            card.SdsUrl = GetJsonString(root, "sds_url");
            llmDiisocianati = ParseYesNo(GetJsonString(root, "diisocianati"));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Errore nel parsing della risposta LLM: {Json}", json);
            result.Message = "La risposta del servizio LLM non è un JSON valido";
            return result;
        }

        // Nessun dato inventato: ogni valore deve essere scritto nel testo della SDS,
        // altrimenti non viene salvato e il campo resta "da verificare" sulla scheda PDF.
        // Con l'OCR i controlli "non trovato" diventano avvisi: i caratteri riconosciuti
        // possono avere errori e i dati vanno controllati a mano sulla scheda.
        var verifier = new SdsVerifier(truncated, ocrUsed);
        verifier.Verify(card, fileName);

        // Pittogrammi: controllo deterministico per immagini. I simboli GHS nelle SDS sono
        // quasi sempre solo immagini, quindi i codici scritti dal modello non si ritrovano
        // nel testo. Si confrontano le immagini del PDF con i 9 simboli di riferimento
        // (ritagliati dal foglio "Pittogrammi" dell'Excel): è un confronto, non una deduzione.
        if (ocrUsed)
        {
            verifier.Issues.Add(("pittogrammi", "testo letto con OCR: i pittogrammi non sono riconoscibili con il confronto immagini"));
        }
        else
        {
            var detected = DetectPictogramsFromImages(pdfBuffer.ToArray(), fileName);
            if (detected.Count > 0)
            {
                card.Pittogrammi = string.Join(", ", detected.Select(d => d.Code).Distinct().OrderBy(c => c));
                verifier.Issues.RemoveAll(i => i.Campo == "pittogrammi");
                _logger.LogInformation("Scheda {File}: pittogrammi riconosciuti dalle immagini: {Picto}",
                    fileName, card.Pittogrammi);
            }
        }

        // Calcoli fatti solo su dati verificati: COV da g/l a % con la densità, diisocianati dalla composizione
        card.CovPercent = NormalizeCov(card.CovPercent, card.Densita);
        var diisocianati = DetectDiisocyanates(card.Composizione, card.ComposizioneCasSopra, card.ComposizioneCasSotto);
        if (diisocianati == true)
            card.ContieneDiisocianati = true;
        else if (llmDiisocianati == true)
            verifier.Issues.Add(("contieneDiisocianati", "indicati dal modello ma non riconoscibili nella composizione verificata"));
        else if (llmDiisocianati == false && (card.Composizione ?? card.ComposizioneCasSopra) != null)
            card.ContieneDiisocianati = false;

        if (verifier.Issues.Count > 0)
        {
            card.CampiDaVerificare = string.Join(",", verifier.Issues.Select(i => i.Campo).Distinct());
            card.NoteVerifica = string.Join("\n", verifier.Issues.Select(i => $"{i.Campo}: {i.Motivo}"));
            _logger.LogInformation("Scheda {File}: {Count} dati non verificati nel testo della SDS\n{Note}",
                fileName, verifier.Issues.Count, card.NoteVerifica);
        }

        if (card.DataScadenza != null)
        {
            var days = (card.DataScadenza.Value.Date - DateTime.Today).Days;
            card.Stato = days < 0 ? "Expired" : days <= 90 ? "Expiring" : "Valid";
            card.DaysRemaining = days;
        }

        if (client != null) card.Clients.Add(client);
        _context.SafetyCards.Add(card);
        await _context.SaveChangesAsync();

        // Allega il PDF originale alla scheda (serve l'id della scheda per il percorso)
        try
        {
            pdfBuffer.Position = 0;
            card.PdfUrl = await _fileStorage.SavePdfAsync(card.Id, pdfBuffer, fileName ?? "sds.pdf");
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Scheda {CardId} creata ma salvataggio PDF fallito", card.Id);
        }

        result.Success = true;
        result.Message = (card.PdfUrl != null
            ? $"Scheda \"{card.Titolo}\" creata con PDF allegato"
            : $"Scheda \"{card.Titolo}\" creata (PDF non allegato)")
            + (verifier.Issues.Count > 0
                ? $": {card.CampiDaVerificare!.Split(',').Length} campi da verificare sulla scheda"
                : "");
        result.Card = SafetyCardDto.From(card);

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

    // Scheda con lo stesso PDF. Per le schede importate prima dell'impronta SHA-256, la si calcola dal file salvato
    private async Task<SafetyCard?> FindCardByPdfHashAsync(string hash)
    {
        var card = await _context.SafetyCards.Include(sc => sc.Clients).FirstOrDefaultAsync(sc => sc.PdfHash == hash);
        if (card != null) return card;

        var withoutHash = await _context.SafetyCards.Include(sc => sc.Clients)
            .Where(sc => sc.PdfHash == null && sc.PdfUrl != null).ToListAsync();
        SafetyCard? match = null;
        foreach (var sc in withoutHash)
        {
            var path = _fileStorage.GetFilePath(sc.PdfUrl!);
            if (path == null) continue;
            sc.PdfHash = Convert.ToHexString(SHA256.HashData(await File.ReadAllBytesAsync(path)));
            if (sc.PdfHash == hash) match ??= sc;
        }
        if (withoutHash.Count > 0) await _context.SaveChangesAsync();
        return match;
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

    // PDF scansionato: rasterizza ogni pagina e la legge con OCR (italiano + inglese).
    // I caratteri riconosciuti possono avere errori: chi usa il testo deve controllarlo.
    private string OcrPdfPages(byte[] pdfBytes, string fileName)
    {
        var renderer = new PdfPageRenderer();
        using var doc = UglyToad.PdfPig.PdfDocument.Open(new MemoryStream(pdfBytes));
        var pageCount = doc.NumberOfPages;

        var parts = new List<string>();
        for (var i = 0; i < pageCount; i++)
        {
            using var pagePng = new MemoryStream(renderer.RenderPage(pdfBytes, i));
            var pageText = _ocr.RecognizeText(pagePng);
            if (!string.IsNullOrWhiteSpace(pageText))
                parts.Add($"[Pagina {i + 1}]\n{pageText}");
            _logger.LogInformation("OCR PDF {File}: pagina {Page}/{Total} -> {Chars} caratteri",
                fileName, i + 1, pageCount, pageText?.Length ?? 0);
        }
        return string.Join("\n", parts);
    }

    // Confronto deterministico: estrae le immagini dal PDF e le confronta con i 9 simboli
    // GHS di riferimento. Restituisce i pittogrammi riconosciuti (nessun modello, nessun'invenzione)
    private List<GhsMatch> DetectPictogramsFromImages(byte[] pdfBytes, string fileName)
    {
        var images = new PdfImageExtractor().ExtractImages(pdfBytes);
        _logger.LogInformation("PDF {File}: estratte {Count} immagini incorporate", fileName, images.Count);

        var matches = new List<GhsMatch>();
        foreach (var img in images)
        {
            matches.AddRange(_ghsMatcher.Value.FindMatches(img.PngBytes));
        }
        return matches;
    }

    private async Task<string?> CallLlmAsync(string pdfText)
    {
        // Lo slash finale nella configurazione (es. "http://host:9005/") produrrebbe "//v1/..." e un 404
        var baseUrl = (_configuration["LLM:BaseUrl"] ?? "http://localhost:8000").TrimEnd('/');
        var model = _configuration["LLM:Model"] ?? "hexagon";
        var apiKey = _configuration["LLM:ApiKey"];
        var timeout = int.TryParse(_configuration["LLM:TimeoutSeconds"], out var t) ? t : 300;
        var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(timeout);
        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
        }

        // Regola principale: solo dati scritti nella SDS. Ogni valore viene poi controllato da SdsVerifier
        // sul testo: quello che non si ritrova non viene salvato
        var prompt = "Dal testo della SDS estrai i dati e restituisci SOLO un JSON valido con questa struttura: " +
            "{ " +
            "\"titolo\": \"nome del prodotto chimico (punto 1.1)\", " +
            "\"produttore\": \"nome della società produttrice/fornitrice (punto 1.3), senza indirizzo\", " +
            "\"frasi_h\": \"codici delle frasi H e EUH della sezione 2.1 (es. H225, H315, EUH066) separati da virgola. Se nella SDS c'è solo la descrizione della frase H, riporta il codice corrispondente. Le frasi R (es. R35) non sono frasi H: non riportarle\", " +
            "\"pittogramma\": \"codici dei pittogrammi GHS (es. GHS02) scritti nella sezione 2.2, separati da virgola. Se nel testo non compare il codice GHS usa null: non dedurlo dalle frasi H o dai simboli\", " +
            "\"composizione_cas_sopra_01\": \"componenti presenti in quantità > 0,1% (punto 3) nel formato nome|n. CAS|%, separati da virgola. Il n. CAS ha il formato 64-17-5: NON usare il numero CE/EC (es. 200-578-6) né il numero indice CLP (es. 603-002-00-5); se il CAS manca lascia vuoto quel campo. Riporta la percentuale esattamente come scritta (es. '30 - 32,5%'), senza calcolare valori medi\", " +
            "\"composizione_cas_sotto_01\": \"componenti presenti in quantità < 0,1% (punto 3), stesso formato nome|n. CAS|%. Classifica ogni componente in base al limite superiore del suo intervallo: va qui solo se è inferiore a 0,1% (es. 0,05%); 0,5% o '<1%' sono maggiori di 0,1% e vanno in composizione_cas_sopra_01\", " +
            "\"composizione\": \"composizione del prodotto (punto 3): nome e percentuale di ogni componente come scritti nella SDS\", " +
            "\"diisocianati\": \"si se nel nome di un componente compare 'diiso' o 'di-iso', altrimenti no\", " +
            "\"stato_fisico\": \"stato fisico (punto 9)\", " +
            "\"teb\": \"temperatura di ebollizione (punto 9) come scritta, con l'unità\", " +
            "\"cov_percent\": \"COV/VOC esattamente come riportato nella SDS, in % oppure in g/l con l'unità (es. '650 g/l'). Se non è riportato usa null: non stimarlo e non calcolarlo\", " +
            "\"densita\": \"densità (punto 9) come scritta, con l'unità\", " +
            "\"sds_url\": \"URL della SDS se scritto nel testo, altrimenti null\", " +
            "\"data_sds\": \"data di compilazione/revisione della SDS in formato YYYY-MM-DD, se scritta, altrimenti null\", " +
            "\"versione\": \"numero di versione o revisione della SDS come scritto, altrimenti null\", " +
            "\"data_scadenza\": \"data di scadenza/validità della SDS in formato YYYY-MM-DD solo se scritta esplicitamente, altrimenti null\" " +
            "} " +
            "REGOLE: riporta solo dati scritti esplicitamente nel testo della SDS. Non dedurre, non stimare, non calcolare, " +
            "non completare con conoscenze generali sulle sostanze. Se un dato manca, è illeggibile o hai dubbi usa null: " +
            "un campo vuoto verrà controllato a mano sulla scheda, un dato sbagliato no. Non aggiungere testo fuori dal JSON.";

        var payload = new
        {
            model = model,
            messages = new[]
            {
                new { role = "system", content = "Sei un analista di schede di sicurezza (SDS) chimiche. Estrai solo i dati scritti nel testo fornito, senza inventare né dedurre nulla: se un dato non c'è o è incerto usa null. Rispondi SEMPRE con un solo oggetto JSON valido, senza testo aggiuntivo." },
                new { role = "user", content = prompt + "\n\nTESTO DELLA SDS:\n" + pdfText }
            },
            temperature = 0,
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

    // Chiave per riconoscere lo stesso prodotto: nome + produttore, senza differenze di maiuscole e spazi
    private static string CardKey(string? titolo, string? produttore) =>
        System.Text.RegularExpressions.Regex.Replace($"{titolo}|{produttore}".ToLowerInvariant(), @"\s+", " ").Trim();

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
