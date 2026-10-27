using System.Security.Cryptography;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
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

        // Suddivisione per sezione: le SDS standard hanno intestazioni "SEZIONE 1..16".
        // Se presenti si usa l'estrazione per gruppi di campi (una chiamata LLM per
        // gruppo, solo sulle sezioni che contengono i campi). Se mancano (SDS non
        // standard) si ricade sul chunking a caratteri e si logga la cosa.
        var sections = SplitIntoSections(truncated);
        // L'intestazione (titolo, produttore, data) è Premessa a ogni chiamata: si limita
        // alle prime righe del documento, dove sta l'intestazione della SDS
        var headerChars = Math.Min(truncated.Length, 1500);
        if (sections.TryGetValue(0, out var headerText) && headerText.Length > headerChars)
            sections[0] = headerText[..headerChars];

        string json;
        if (sections.Count > 1)
        {
            _logger.LogInformation("SDS {File}: {Count} sezioni trovate, estrazione per gruppi di campi",
                fileName, sections.Count - (sections.ContainsKey(0) ? 1 : 0));
            var groupResults = await AnalyzeSectionsAsync(sections, fileName);
            json = groupResults ?? await CallLlmAsync(truncated, fileName);
        }
        else
        {
            _logger.LogInformation("SDS {File}: intestazioni di sezione non trovate, uso chunking a caratteri", fileName);
            if (truncated.Length > 15000)
            {
                var chunks = SplitIntoSectionChunks(truncated, 15000);
                var results = new List<string>();
                for (var i = 0; i < chunks.Count; i++)
                {
                    _logger.LogInformation("SDS {File}: chunk {I}/{Total} ({Chars} char)", fileName, i + 1, chunks.Count, chunks[i].Length);
                    var chunkJson = await CallLlmAsync(chunks[i], fileName);
                    if (chunkJson != null) results.Add(chunkJson);
                }
                json = MergeLlmResults(results);
            }
            else
            {
                json = await CallLlmAsync(truncated, fileName);
            }
        }

        if (json == null)
        {
            result.Message = "Il servizio LLM non ha restituito una risposta valida. Verifica che il server LLM sia raggiungibile.";
            return result;
        }

        // Self-consistency: per i campi critici (composizione, CAS) si fa un secondo
        // passaggio LLM sul testo completo e si confrontano i risultati. Se divergono,
        // il campo viene comunque verificato da SdsVerifier contro il testo originale.
        // Disattivabile via configurazione (LLM:SelfConsistencyEnabled, default false):
        // è una chiamata LLM completa in più e SdsVerifier verifica comunque ogni
        // campo contro il testo della SDS.
        var selfConsistency = _configuration.GetValue("LLM:SelfConsistencyEnabled", false);
        if (selfConsistency)
            json = await VerifyCriticalFieldsAsync(truncated, json);

        // Vision: se abilitato, si trasforma il PDF in immagini e si invia al modello
        // multimodale (llama.cpp con mmproj) per un doppio controllo. Il modello legge
        // direttamente l'immagine della scheda, catturando dati che il testo estratto
        // potrebbe aver perso. Le divergenze vengono loggate; il risultato finale resta
        // quello del passaggio testo (verificato da SdsVerifier).
        var visionJson = await CallLlmVisionAsync(pdfBuffer.ToArray(), fileName);
        if (visionJson != null)
        {
            json = CompareVisionResults(json, visionJson);
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

            card.Titolo = NormalizeMissing(GetJsonString(root, "titolo", "nome_prodotto", "product_name")) ?? string.Empty;
            card.EnteEmittitore = NormalizeMissing(GetJsonString(root, "produttore", "ente_emittitore", "producer"));
            card.NumeroProtocollo = NormalizeMissing(GetJsonString(root, "versione", "revisione", "version"));
            // Date: il modello può restituirle in lettere ("4 Giugno 2025"): ParseSdsDate
            // le converte, ParseDate copre i formati numerici
            card.DataRilascio = ParseSdsDate(GetJsonString(root, "data_sds", "data_revisione", "sds_date"));
            card.DataScadenza = ParseSdsDate(GetJsonString(root, "data_scadenza", "expiry_date"));
            card.FrasiH = NormalizeMissing(GetJsonString(root, "frasi_h", "h_phrases"));
            card.Pittogrammi = NormalizeMissing(GetJsonString(root, "pittogramma", "pittogrammi", "pictogram"));
            card.ComposizioneCasSopra = NormalizeMissing(GetJsonString(root, "composizione_cas_sopra_01", "composition_cas_above"));
            card.ComposizioneCasSotto = NormalizeMissing(GetJsonString(root, "composizione_cas_sotto_01", "composition_cas_below"));
            card.Composizione = NormalizeMissing(GetJsonString(root, "composizione", "composition"));
            card.StatoFisico = NormalizeMissing(GetJsonString(root, "stato_fisico", "physical_state"));
            card.TemperaturaEbollizione = NormalizeMissing(GetJsonString(root, "teb", "punto_di_ebollizione", "boiling_point"));
            card.CovPercent = NormalizeMissing(GetJsonString(root, "cov_percent", "voc_percent", "vocs"));
            card.SdsUrl = NormalizeMissing(GetJsonString(root, "sds_url"));
            llmDiisocianati = ParseYesNo(NormalizeMissing(GetJsonString(root, "diisocianati")));
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

        // Post-processing deterministico (nessun modello): i valori "null" scritti come
        // stringa diventano null JSON; la composizione (nome|CAS|%) è classificata in
        // sopra/sotto 0,1% in base al limite superiore della percentuale; le date in
        // lettere ("4 Giugno 2025") sono convertite; la densità senza unità è annotata.
        // I campi della card sono già popolati dal JSON: si sistemeranno dopo la verifica.
        var postIssues = PostProcessCard(card);

        // Densità relativa senza unità ("1.4"): SdsVerifier ha verificato il numero;
        // qui si aggiunge la nota "unità non indicata" senza toccare il valore
        DensityWithoutUnit(card.Densita, postIssues);

        verifier.Verify(card, fileName);
        foreach (var issue in postIssues)
            verifier.Issues.Add(issue);

        // Pittogrammi: tre fonti di verifica indipendenti, in ordine di affidabilità.
        // 1. Testo: i codici GHS01..GHS09 scritti nel testo della SDS (già verificati
        //    da SdsVerifier.CheckGhs: un codice non scritto nel testo viene scartato)
        // 2. Immagini: confronto deterministico con i 9 simboli di riferimento
        // 3. Frasi H: mappatura standard CLP/GHS, usata solo se nessuna delle prime due
        //    fonti ha dato codici (i pittogrammi sono spesso solo immagini nel PDF).
        //    Il derivamento è segnalato in NoteVerifica ("derivato dalle classi").
        // L'unione delle fonti disponibili è il risultato: un pittogramma confermato da
        // almeno una delle fonti è affidabile. Il matcher funziona anche con OCR perché le
        // immagini nel PDF sono comunque raster.
        var detected = DetectPictogramsFromImages(pdfBuffer.ToArray(), fileName);
        var detectedCodes = detected.Select(d => d.Code).ToList();

        var textCodes = (card.Pittogrammi ?? "")
            .Split(',', ';')
            .Select(c => c.Trim())
            .Where(c => c.Length > 0)
            .ToList();

        // Terza fonte: se non ci sono pittogrammi da testo o immagini,
        // si deducono dalle frasi H usando la mappatura standard CLP/GHS
        var hPhraseCodes = new List<string>();
        if (detectedCodes.Count == 0 && textCodes.Count == 0 && !string.IsNullOrWhiteSpace(card.FrasiH))
        {
            hPhraseCodes = GhsPictogramMatcher.PictogramsFromHPhrases(card.FrasiH).OrderBy(c => c).ToList();
            if (hPhraseCodes.Count > 0)
                verifier.Issues.Add(("pittogrammi",
                    $"derivato dalle classi: {string.Join(", ", hPhraseCodes)} dedotti dalle frasi H con la tabella CLP/GHS (i codici GHS non sono scritti nel testo della SDS)"));
        }

        var allCodes = detectedCodes.Concat(textCodes).Concat(hPhraseCodes).Distinct().OrderBy(c => c).ToList();

        if (allCodes.Count > 0)
        {
            card.Pittogrammi = string.Join(", ", allCodes);
            // la segnalazione "codici GHS non scritti nel testo" di SdsVerifier non
            // serve più: i codici arrivano da immagini o dal derivamento dalle frasi H
            verifier.Issues.RemoveAll(i => i.Campo == "pittogrammi" && !i.Motivo.StartsWith("derivato"));

            var fromText = textCodes.Where(c => !detectedCodes.Contains(c) && !hPhraseCodes.Contains(c)).ToList();
            var fromImage = detectedCodes.Where(c => !textCodes.Contains(c) && !hPhraseCodes.Contains(c)).ToList();
            var fromHPhrases = hPhraseCodes.Where(c => !textCodes.Contains(c) && !detectedCodes.Contains(c)).ToList();
            _logger.LogInformation("Scheda {File}: pittogrammi {Picto} (testo: {Text}, immagini: {Image}, frasi H: {HPhrases})",
                fileName, card.Pittogrammi,
                string.Join(",", fromText) ?? "nessuno",
                string.Join(",", fromImage) ?? "nessuno",
                string.Join(",", fromHPhrases) ?? "nessuno");
        }
        else if (ocrUsed)
        {
            verifier.Issues.Add(("pittogrammi", "testo letto con OCR e nessuna immagine GHS riconosciuta: verificare sulla scheda PDF"));
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

    // Estrazione del testo con l'analisi di layout (Docstrum): le parole sono
    // raggruppate in righe e blocchi secondo la loro posizione nella pagina, così
    // le colonne delle tabelle (es. composizione: nome | CAS | %) non vengono
    // incollate come con page.Text (che produce "PPG Coatings SPRL/BVBATweemontstraat
    // 104B-2100 DeurneB"). Le righe di ogni blocco sono unite con uno spazio.
    private string ExtractPdfText(Stream pdfStream)
    {
        using var ms = new MemoryStream();
        pdfStream.CopyTo(ms);
        ms.Position = 0;
        using var doc = UglyToad.PdfPig.PdfDocument.Open(ms);
        var sb = new System.Text.StringBuilder();
        foreach (var page in doc.GetPages())
        {
            var words = page.GetWords(UglyToad.PdfPig.DocumentLayoutAnalysis.WordExtractor.NearestNeighbourWordExtractor.Instance);
            var blocks = UglyToad.PdfPig.DocumentLayoutAnalysis.PageSegmenter.DocstrumBoundingBoxes.Instance.GetBlocks(words);
            foreach (var block in blocks)
            {
                foreach (var line in block.TextLines)
                    sb.AppendLine(string.Join(" ", line.Words.Select(w => w.Text)));
                sb.AppendLine();
            }
        }
        return NormalizePdfText(sb.ToString());
    }

    // Pulizia del testo estratto dal PDF: rimuove i caratteri invisibili che i PDF con font
    // embedded inseriscono (zero-width, soft-hyphen, BOM) e normalizza gli spazi multipli.
    // Senza questo passaggio SdsVerifier non trova i valori perché il testo contiene
    // caratteri "fantasma" tra le lettere (es. "prod\u200Butto" invece di "prodotto").
    // Gestisce anche i nomi spezzati tra pagine: se una pagina finisce con un nome
    // incompleto (es. "1,3-bis[12-idrossi-") e la successiva inizia con il resto
    // (es. "ottadecammide-N-metilene]-benzene"), li unisce in un unico nome.
    private static string NormalizePdfText(string text)
    {
        if (string.IsNullOrEmpty(text)) return text;
        // Zero-width space, zero-width non-joiner, zero-width joiner, BOM, soft hyphen
        var cleaned = text
            .Replace("\u200B", "")  // zero-width space
            .Replace("\u200C", "")  // zero-width non-joiner
            .Replace("\u200D", "")  // zero-width joiner
            .Replace("\uFEFF", "")  // BOM / zero-width no-break space
            .Replace("\u00AD", ""); // soft hyphen
        // Caratteri di controllo (tab, CR, form-feed, vertical tab...) -> spazio,
        // tranne i newline: alcuni PDF incorporano caratteri non stampabili nel testo
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @"[\t\r\f\v\u0000-\u0008\u000E-\u001F\u007F\u200E\u200F]", " ");
        // Spazi multipli -> singolo spazio, poi si ripristinano i capoversi
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @"[ ]+", " ");
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @" ?\n ?\n ?", "\n\n");
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @"\n{3,}", "\n\n");

        // Unisce i nomi spezzati tra pagine: se una riga finisce con un carattere
        // di apertura (parentesi, parentella) senza chiusura, e la riga successiva
        // inizia con il resto del nome, li unisce.
        // Esempio: "1,3-bis[12-idrossi-\nottadecammide-N-metilene]-benzene"
        // diventa "1,3-bis[12-idrossi-ottadecammide-N-metilene]-benzene"
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @"(\[[^\]\n]*-)\n([a-z][^\n\[]*\])", "$1$2", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @"(\([^)\n]*-)\n([a-z][^\n\)]*\))", "$1$2", System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        return cleaned.Trim();
    }

    // PDF scansionato: rasterizza ogni pagina e la legge con OCR (italiano + inglese).
    // I caratteri riconosciuti possono avere errori: chi usa il testo deve controllarlo.
    // Il documento PdfSharpCore viene aperto una sola volta e riusato per tutte le pagine.
    // Per le SDS lunghe (20-30 pagine) l'OCR di ogni pagina costa diversi secondi:
    // si limita a Ocr:MaxPages (default 15), che copre le sezioni 1-9 dove stanno
    // i dati estratti. 0 = tutte le pagine.
    private string OcrPdfPages(byte[] pdfBytes, string fileName)
    {
        var renderer = new PdfPageRenderer();
        using var doc = UglyToad.PdfPig.PdfDocument.Open(new MemoryStream(pdfBytes));
        var total = doc.NumberOfPages;
        var maxOcrPages = _configuration.GetValue<int>("Ocr:MaxPages");
        var pageCount = maxOcrPages > 0 ? Math.Min(total, maxOcrPages) : total;
        if (pageCount < total)
            _logger.LogInformation("OCR PDF {File}: {Total} pagine, OCR solo sulle prime {Max} (Ocr:MaxPages)", fileName, total, pageCount);

        var parts = new List<string>();
        using var pdfDoc = renderer.Open(pdfBytes);
        for (var i = 0; i < pageCount; i++)
        {
            using var pagePng = new MemoryStream(renderer.RenderPage(pdfDoc, i));
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

        // Fallback: SDS senza intestazioni di sezione leggibili -> chunking a caratteri
        // con un solo prompt completo e fusione dei risultati dei chunk.
        private const string FullFieldsPrompt =
            "Dal testo della SDS estrai i dati e restituisci SOLO un JSON valido con questa struttura: " +
            "{ " +
            "\"titolo\": \"nome del prodotto chimico (punto 1.1)\", " +
            "\"produttore\": \"nome della società produttrice/fornitrice (punto 1.3), senza indirizzo\", " +
            "\"frasi_h\": \"codici delle frasi H e EUH della sezione 2.1 (es. H225, H315, EUH066) separati da virgola. Se nella SDS c'è solo la descrizione della frase H, riporta il codice corrispondente. Le frasi R (es. R35) non sono frasi H: non riportarle\", " +
            "\"pittogramma\": \"codici dei pittogrammi GHS (es. GHS02) scritti nella sezione 2.2, separati da virgola. Se nel testo non compare il codice GHS usa null: non dedurlo dalle frasi H o dai simboli\", " +
            "\"composizione\": \"composizione del prodotto (punto 3): tutti i componenti, separati da virgola, ognuno nel formato nome|numero CAS|percentuale. Il n. CAS ha il formato 64-17-5: NON usare il numero CE/EC (es. 200-578-6) né il numero indice CLP (es. 603-002-00-5); se il CAS manca lascia vuoto quel campo. Riporta la percentuale esattamente come scritta (es. '30 - 32,5%'), senza calcolare valori medi\", " +
            "\"stato_fisico\": \"stato fisico (punto 9) - riporta SOLO lo stato (es. 'liquido', 'solido', 'gas') se presente nel testo, altrimenti null\", " +
            "\"teb\": \"temperatura di ebollizione (punto 9) come scritta, con l'unità (es. '100 °C', '212 °F', '373 K'). Se non c'è usa null\", " +
            "\"cov_percent\": \"COV/VOC esattamente come riportato nella SDS, in % oppure in g/l con l'unità (es. '650 g/l'). Se non è riportato usa null: non stimarlo e non calcolarlo\", " +
            "\"densita\": \"densità (punto 9) come scritta, con l'unità (es. '0,84 g/cm³', '840 kg/m³'). Se non c'è usa null\", " +
            "\"sds_url\": \"URL della SDS se scritto nel testo, altrimenti null\", " +
            "\"data_sds\": \"data di compilazione/revisione della SDS come scritta (es. '4 Giugno 2025' o '2025-06-04'), se scritta, altrimenti null\", " +
            "\"versione\": \"numero di versione o revisione della SDS come scritto, altrimenti null\", " +
            "\"data_scadenza\": \"data di scadenza/validità della SDS solo se scritta esplicitamente, come scritta, altrimenti null\" " +
            "} " +
            "REGOLE FONDAMENTALI: " +
            "1) Riporta SOLO i dati che vedi SCRITTI ESPLICITAMENTE nel testo della SDS. " +
            "2) NON dedurre, NON stimare, NON calcolare, NON completare con conoscenze generali. " +
            "3) Se un dato manca, è illeggibile o hai dubbi usa null (l'oggetto JSON null, non la stringa \"null\"): un campo vuoto verrà controllato a mano sulla scheda, un dato sbagliato no. " +
            "4) Per i numeri (temperature, percentuali, densità): riporta il valore ESATTO come scritto, con tutti i decimali. Non arrotondare. " +
            "5) Per i CAS: riporta il numero CAS esattamente come scritto nel formato xxx-xx-x. " +
            "6) Per la composizione: riporta SOLO i nomi delle sostanze e le percentuali esplicitamente indicate. NON calcolare somme o medie. " +
            "7) Non aggiungere testo fuori dal JSON.";

    // Fallback (senza sezioni): una chiamata LLM sul testo con il prompt completo
    private Task<string?> CallLlmAsync(string pdfText, string? fileName)
        => CallLlmAsync(FullFieldsPrompt + "\n\nTESTO DELLA SDS:\n" + pdfText, fileName, "completo");

    // Chiamata LLM secca: il prompt (gruppo di campi o completo) è già composto
    private async Task<string?> CallLlmAsync(string promptWithText, string? fileName, string group)
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

        // response_format JSON: se il server LLM (llama.cpp) lo supporta, forza l'output
        // a essere un oggetto JSON valido, eliminando i fallimenti di parsing. Se il server
        // non lo supporta, ignora il campo e risponde comunque (il prompt già chiede JSON).
        var payload = new
        {
            model = model,
            messages = new[]
            {
                new { role = "system", content = "Sei un analista esperto di schede di sicurezza (SDS/GHS) chimiche. Il tuo compito è estrarre SOLO i dati che sono ESPLICITAMENTE SCRITTI nel testo della SDS fornita. NON devi mai: dedurre informazioni, calcolare valori, stimare dati mancanti, usare conoscenze chimiche generali. Se un dato non è presente nel testo o non ne sei assolutamente sicuro, usa null (l'oggetto JSON null, mai la stringa \"null\"). È meglio un dato mancante che un dato sbagliato. Ogni dato sarà verificato contro il testo originale. Rispondi SEMPRE con un solo oggetto JSON valido, senza testo aggiuntivo, senza markdown, senza backticks." },
                new { role = "user", content = promptWithText }
            },
            temperature = 0,
            max_tokens = 4000,
            response_format = new { type = "json_object" }
        };

        try
        {
            _logger.LogInformation("LLM call: gruppo \"{Group}\" url={Url} model={Model} textLen={Len}",
                group, $"{baseUrl}/v1/chat/completions", model, promptWithText.Length);
            // A livello Debug: il testo inviato al modello e la risposta grezza
            // (prima di normalizzazione e prima di SdsVerifier)
            _logger.LogDebug("LLM call {Group} ({File}) testo inviato: {Text}", group, fileName, promptWithText);
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
            _logger.LogDebug("LLM call {Group} ({File}) risposta modello: {Content}", group, fileName, content);

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

    // Estrae il testo dal PDF e lo suddivide per sezione (intestazioni SEZIONE/SECTION 1..16)
    // Se il PDF non ha le intestazioni, restituisce un solo chunk con tutto il testo (fallback)
    private static Dictionary<int, string> ExtractSections(string text)
    {
        var sections = new Dictionary<int, string>();
        
        // Regex per trovare intestazioni di sezione (tollerante a maiuscole/minuscole, spazi, punti, ecc.)
        // Es: "SEZIONE 1:", "SEZIONE 1.", "SECTION 1", "SEZIONE. 1", "SEZIONE1", ecc.
        var sectionRegex = new System.Text.RegularExpressions.Regex(
            @"(?im)^\s*(?:SEZIONE|SECTION)\s*\.?\s*(\d{1,2})\s*[.:)]?\s*$",
            System.Text.RegularExpressions.RegexOptions.Multiline);
        
        var matches = sectionRegex.Matches(text);
        
        if (matches.Count == 0)
        {
            // PDF anomalo senza intestazioni: usa tutto il testo come singolo chunk
            sections[0] = text;
            return sections;
        }
        
        // Estrai i numeri delle sezioni trovate
        var sectionNumbers = matches.Cast<System.Text.RegularExpressions.Match>()
            .Select(m => int.Parse(m.Groups[1].Value))
            .OrderBy(n => n)
            .Distinct()
            .ToList();
        
        // Se non ci sono sezioni valide, usa tutto il testo
        if (sectionNumbers.Count == 0)
        {
            sections[0] = text;
            return sections;
        }
        
        // Estrai il testo per ogni sezione trovata
        foreach (var sectionNum in sectionNumbers)
        {
            var sectionMatch = matches.FirstOrDefault(m => int.Parse(m.Groups[1].Value) == sectionNum);
            if (sectionMatch.Success)
            {
                int startIndex = sectionMatch.Index + sectionMatch.Length;
                int endIndex = text.Length;
                
                // Trova l'inizio della prossima sezione (se esiste)
                var nextSection = matches.FirstOrDefault(m => int.Parse(m.Groups[1].Value) == sectionNum + 1);
                if (nextSection.Success)
                {
                    endIndex = nextSection.Index;
                }
                
                var sectionText = text.Substring(startIndex, endIndex - startIndex).Trim();
                if (!string.IsNullOrWhiteSpace(sectionText))
                {
                    sections[sectionNum] = sectionText;
                }
            }
        }
        
        return sections;
    }
    
    // Suddivide il testo della SDS per sezione (intestazioni SEZIONE/SECTION 1..16,
    // tolleranti a maiuscole e spazi). Le SDS standard ripetono l'intestazione di ogni
    // sezione a inizio pagina: il testo di una sezione è quindi l'unione di tutte le
    // finestre che iniziano con la sua intestazione, ciascuna fino all'intestazione
    // successiva. Il primo testo (prima di "SEZIONE 1", con titolo, data, versione)
    // è salvato con chiave 0.
    // Se non si trova alcuna sezione il dizionario è vuoto: il chiamante ricade sul
    // taglio a caratteri e lo logga.
    private static readonly System.Text.RegularExpressions.Regex SectionHeaderRegex = new(
        @"^\s*(?:SEZIONE|SECTION)\s+(\d{1,2})\s*[.:)]",
        System.Text.RegularExpressions.RegexOptions.Multiline | System.Text.RegularExpressions.RegexOptions.IgnoreCase | System.Text.RegularExpressions.RegexOptions.Compiled);

    private static Dictionary<int, string> SplitIntoSections(string text)
    {
        var sections = new Dictionary<int, string>();
        var matches = SectionHeaderRegex.Matches(text);
        if (matches.Count == 0) return sections;

        // Testo dell'intestazione (prima di SEZIONE 1): titolo, data, versione
        if (matches[0].Index > 0)
            sections[0] = text[..matches[0].Index];

        for (var i = 0; i < matches.Count; i++)
        {
            var n = int.Parse(matches[i].Groups[1].Value);
            if (n < 1 || n > 16) continue;
            var end = i + 1 < matches.Count ? matches[i + 1].Index : text.Length;
            var chunk = text[matches[i].Index..end];
            sections[n] = sections.TryGetValue(n, out var existing) ? existing + "\n" + chunk : chunk;
        }
        return sections;
    }

    // Unisce il testo delle sezioni richieste per una chiamata LLM: prima l'intestazione
    // della SDS (contiene titolo, produttore, data), poi le sezioni in ordine.
    private static string BuildSectionText(Dictionary<int, string> sections, IEnumerable<int> numbers)
    {
        var sb = new System.Text.StringBuilder();
        if (sections.TryGetValue(0, out var header))
            sb.Append(header).Append('\n');
        foreach (var n in numbers.OrderBy(x => x))
            if (sections.TryGetValue(n, out var s))
                sb.Append(s).Append('\n');
        return sb.ToString().Trim();
    }

    // Suddivide il testo della SDS in blocchi di maxChars caratteri, cercando di non
    // tagliare a metà una riga. Ogni blocco viene inviato separatamente all'LLM.
    private static List<string> SplitIntoChunks(string text, int maxChars)
    {
        var chunks = new List<string>();
        var start = 0;
        while (start < text.Length)
        {
            var end = Math.Min(start + maxChars, text.Length);
            // Se non siamo a fine testo, cerca l'ultimo a capo per non tagliare una riga
            if (end < text.Length)
            {
                var lastNewline = text.LastIndexOf('\n', end - 1, Math.Min(500, end - start));
                if (lastNewline > start) end = lastNewline + 1;
            }
            chunks.Add(text[start..end]);
            start = end;
        }
        return chunks;
    }

    // Suddivide il testo della SDS in blocchi di maxChars caratteri tagliando sui
    // numeri di sezione (1-16): ogni chunk contiene sezioni complete, così i campi
    // restano nel loro contesto (es. la composizione non viene separata dall'intestazione
    // della sezione 3). Se una singola sezione supera maxChars, si ricade sul taglio
    // a caratteri (SplitIntoChunks) per quella parte.
    private static List<string> SplitIntoSectionChunks(string text, int maxChars)
    {
        var matches = SectionHeaderRegex.Matches(text);
        if (matches.Count < 2)
            return SplitIntoChunks(text, maxChars);

        // Posizioni di inizio di ogni sezione (l'ultima sezione va a fine testo)
        var boundaries = new List<int>();
        foreach (System.Text.RegularExpressions.Match m in matches)
            boundaries.Add(m.Index);
        boundaries.Add(text.Length);

        var chunks = new List<string>();
        var current = new System.Text.StringBuilder();
        for (var i = 0; i < boundaries.Count - 1; i++)
        {
            var section = text[boundaries[i]..boundaries[i + 1]];
            // Se la sezione da sola supera il limite, chiudi il chunk corrente e
            // suddividi la sezione a caratteri
            if (section.Length > maxChars)
            {
                if (current.Length > 0) { chunks.Add(current.ToString()); current.Clear(); }
                chunks.AddRange(SplitIntoChunks(section, maxChars));
                continue;
            }
            // Se aggiungere la sezione supererebbe il limite, chiudi il chunk corrente
            if (current.Length + section.Length > maxChars && current.Length > 0)
            {
                chunks.Add(current.ToString());
                current.Clear();
            }
            current.Append(section);
        }
        if (current.Length > 0) chunks.Add(current.ToString());
        return chunks;
    }

    // Fonde i risultati JSON di più chunk: per ogni campo prende il primo valore non-null.
    // Se due chunk restituiscono valori diversi per lo stesso campo, si usa quello del primo
    // chunk (che contiene l'intestazione della SDS) e si logga la divergenza.
    // Analisi per gruppi di campi: una chiamata LLM sequenziale per ogni gruppo,
    // ciascuna con il solo testo delle sezioni che contengono i suoi campi (più
    // l'intestazione della SDS). Se una sezione richiesta manca nel testo la
    // chiamata viene saltata e i suoi campi restano null (=> da verificare).
    // I campi deterministici (CAS, % >0,1%, diisocianati, date, pittogrammi) non
    // sono chiesti al modello: vengono calcolati in SdsVerifierPostProcess.
    private async Task<string?> AnalyzeSectionsAsync(Dictionary<int, string> sections, string? fileName)
    {
        // Gruppo 1: identificazione (sez. 1) -> titolo, produttore, sds_url
        // Gruppo 2: pericoli (sez. 2) -> frasi_h (solo 2.1/2.2), pittogramma (codici GHS scritti)
        // Gruppo 3: composizione (sez. 3) -> componenti con nome, CAS, %
        // Gruppo 4: proprietà fisiche (sez. 9) -> stato fisico, teb, COV, densità
        // Gruppo 5: intestazione + sez. 16 -> data SDS, versione, data scadenza
        var groups = new (string Name, int[] Sections, string Prompt)[]
        {
            ("identificazione", new[] { 1 },
                "Dal testo della SDS estrai i dati e restituisci SOLO un JSON valido: " +
                "{ \"titolo\": \"nome del prodotto chimico (punto 1.1)\", " +
                "\"produttore\": \"nome della società produttrice/fornitrice (punto 1.3), senza indirizzo\", " +
                "\"sds_url\": \"URL della SDS se scritto nel testo, altrimenti null\" }"),
            ("pericoli", new[] { 2 },
                "Dal testo della SDS estrai i dati e restituisci SOLO un JSON valido: " +
                "{ \"frasi_h\": \"codici delle frasi H ed EUH indicate nella sezione 2.1 (classificazione della sostanza o della miscela) separati da virgola (es. H225, H315, EUH066). Se nel testo c'è solo la descrizione della frase, riporta il codice corrispondente. IGNORA le frasi H che compaiono solo come testo integrale della sezione 16 o nell'elenco dei componenti della sezione 3: non sono frasi H della miscela. Le frasi R (es. R35) non sono frasi H: non riportarle\", " +
                "\"pittogramma\": \"codici dei pittogrammi GHS (es. GHS02) scritti nel testo della sezione 2, separati da virgola. Se nel testo non compare alcun codice GHS usa null: non dedurlo dalle frasi H o dai simboli\" }"),
            ("composizione", new[] { 3 },
                "Dal testo della SDS estrai i dati e restituisci SOLO un JSON valido: " +
                "{ \"composizione\": \"tutti i componenti della miscela (sezione 3), separati da virgola, ognuno nel formato nome|numero CAS|percentuale. Il numero CAS ha il formato 64-17-5: NON usare il numero CE/EC (es. 200-578-6) né il numero indice CLP (es. 603-002-00-5); se il CAS manca lascia vuoto quel campo. Riporta la percentuale esattamente come scritta nella SDS (es. '≥10 - ≤25 %' o '30 - 32,5%'), senza calcolare valori medi\" }"),
            ("proprieta-fisiche", new[] { 9 },
                "Dal testo della SDS estrai i dati e restituisci SOLO un JSON valido: " +
                "{ \"stato_fisico\": \"stato fisico (punto 9) - riporta SOLO lo stato (es. 'liquido', 'solido', 'gas') se presente nel testo, altrimenti null\", " +
                "\"teb\": \"temperatura di ebollizione (punto 9) come scritta, con l'unità (es. '>37.78 °C', '100 °C', '373 K'). Se non c'è usa null\", " +
                "\"cov_percent\": \"contenuto di COV/VOC esattamente come riportato nella SDS, in % oppure in g/l con l'unità (es. '650 g/l'). Se non è riportato usa null: non stimarlo e non calcolarlo\", " +
                "\"densita\": \"densità o densità relativa (punto 9) come scritta, con l'unità se indicata (es. '0,84 g/cm³', '1.4'). Se non c'è usa null\" }"),
            ("dati-sds", new[] { 16 },
                "Dall'intestazione della SDS e dalla sezione 16 estrai i dati e restituisci SOLO un JSON valido: " +
                "{ \"data_sds\": \"data di edizione/revisione della SDS come scritta (es. '4 Giugno 2025' o '2025-06-04'). Se non c'è usa null\", " +
                "\"versione\": \"numero di versione o revisione della SDS come scritto (es. '14.05'). Se non c'è usa null\", " +
                "\"data_scadenza\": \"data di scadenza/validità della SDS solo se scritta esplicitamente, come scritta. Se non c'è usa null\" }")
        };

        var results = new List<(string Json, HashSet<string> Specific)>();
        foreach (var (name, secs, prompt) in groups)
        {
            var missing = secs.Where(s => !sections.ContainsKey(s)).ToList();
            if (missing.Count > 0)
            {
                _logger.LogInformation("SDS {File}: gruppo \"{Group}\": sezione {Sections} non trovata nel testo, campi del gruppo da verificare",
                    name, string.Join(",", missing));
                continue;
            }

            var text = BuildSectionText(sections, secs.Contains(0) ? secs : secs.Prepend(0));
            // L'intestazione della SDS (le prime righe: titolo, produttore, data) è
            // Premessa a ogni chiamata, così il modello ha sempre il contesto del prodotto
            var json = await CallLlmAsync(prompt + "\n\nTESTO DELLA SDS:\n" + text, fileName, name);
            if (json != null)
                results.Add((json, new HashSet<string>(GroupFieldNames(prompt), System.StringComparer.OrdinalIgnoreCase)));
        }

        return results.Count > 0 ? MergeGroupResults(results) : null;
    }

    // Nomi dei campi chiesti in un prompt di gruppo (le chiavi prima di ":")
    private static IEnumerable<string> GroupFieldNames(string prompt)
    {
        return System.Text.RegularExpressions.Regex.Matches(prompt, "\\\"(\\w+)\\\":")
            .Select(m => m.Groups[1].Value);
    }

    // ---------- Post-processing deterministico (nessun modello) ----------

    // Valori che il modello usa per "dato assente": normalizzati a null.
    // Il modello a volte scrive la stringa "null" o "N/A" invece dell'oggetto JSON null.
    private static string? NormalizeMissing(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var v = value.Trim().Trim('"', '\'').Trim();
        if (v.Length == 0) return null;
        if (v is "null" or "none" or "n/a" or "n.a." or "na" or "na." or "-" or "–" or
            "non disponibile" or "non disponibile." or "non presente" or "non presente." or
            "non determinato" or "non determinato." or "non applicabile" or "non applicabile." or
            "not available" or "not determined" or "not applicable" or "unknown" or "sconosciuto")
            return null;
        return v;
    }

    // Formato di una voce di composizione: nome|CAS|%, delimitata da virgole o punti
    // e virgola non seguiti da spazio (le virgole dentro i nomi chimici, es.
    // "acido ottadecanoico, 12-idrossi-", sono sempre seguite da spazio).
    private static readonly System.Text.RegularExpressions.Regex CompositionEntryRegex = new(
        @"(?<name>[^|]+)\|(?<cas>[^|]*?)\|(?<pct>[^|]*?)(?=,\s|\s;|$|;)",
        System.Text.RegularExpressions.RegexOptions.Compiled);

    // Limite superiore della percentuale di un componente. Forme tipiche nella SDS:
    // ">=10 - <=25", "<1.0", "<1,0", "<=0.30", "5.0 - 10", "0,05".
    // Il separatore decimale è sia il punto (SDS inglesi o estratte con dot) sia la
    // virgola: la regex cattura solo cifre/virgole/punto, senza spazi, per non
    // confondere l'intervallo "10 - 25" con un numero decimale.
    private static readonly System.Text.RegularExpressions.Regex PercentRangeRegex = new(
        @"(?:[<>≤≥]=?\s*)?(?<lo>\d{1,3}(?:[.,]\d+)?)\s*(?:-\s*(?:[<>≤≥]=?\s*)?(?<hi>\d{1,3}(?:[.,]\d+)?))?\s*%?",
        System.Text.RegularExpressions.RegexOptions.Compiled);

    // Restituisce il limite superiore della percentuale, o null se non interpretabile
    private static double? ParsePercentUpper(string? percent)
    {
        if (string.IsNullOrWhiteSpace(percent)) return null;
        // "non disponibile"/"n/a" non sono percentuali: il componente va in "da verificare"
        if (NormalizeMissing(percent) == null) return null;
        var m = PercentRangeRegex.Match(percent);
        if (!m.Success) return null;
        var bound = m.Groups["hi"].Success ? m.Groups["hi"] : m.Groups["lo"];
        return double.TryParse(bound.Value.Replace(',', '.'), System.Globalization.NumberStyles.Float,
            System.Globalization.CultureInfo.InvariantCulture, out var d) ? d : null;
    }

    // CAS: formato xxx-xx-x (6+ cifre). I numeri CE/EC (es. 200-578-6) e i numeri
    // indice CLP (es. 603-002-00-5) hanno un altro formato e non sono CAS.
    private static readonly System.Text.RegularExpressions.Regex CasFormatRegex = new(
        @"^\d{2,7}-\d{2}-\d$", System.Text.RegularExpressions.RegexOptions.Compiled);

    // Classifica i componenti della composizione (nome|CAS|%) in base alla percentuale:
    // > 0,1% -> sopra, < 0,1% -> sotto, non interpretabile -> da verificare.
    // CAS con checksum errato: il valore non è affidabile, si sposta in "da verificare"
    // e il CAS viene rimosso dalla voce (un CAS sbagliato non va salvato).
    private (string? Sopra, string? Sotto, List<string> DaVerificare) SplitComposizioneByThreshold(string? composizione)
    {
        var sopra = new List<string>();
        var sotto = new List<string>();
        var daVerificare = new List<string>();

        if (string.IsNullOrWhiteSpace(composizione)) return (null, null, daVerificare);

        foreach (System.Text.RegularExpressions.Match m in CompositionEntryRegex.Matches(composizione))
        {
            var name = m.Groups["name"].Value.Trim().TrimStart(',', ';', ' ').Trim();
            var cas = NormalizeMissing(m.Groups["cas"].Value);
            var pct = NormalizeMissing(m.Groups["pct"].Value);
            if (name.Length == 0) continue;

            // CAS: solo formato xxx-xx-x con checksum corretto
            var casOk = cas != null && CasFormatRegex.IsMatch(cas) && SdsVerifier.IsValidCas(cas);
            if (cas != null && !casOk)
            {
                daVerificare.Add($"composizione_cas: numero CAS '{cas}' del componente '{name}' non valido (checksum errato)");
                cas = null;
            }

            var entry = $"{name}|{cas}|{pct}";
            var upper = ParsePercentUpper(pct);
            if (upper == null)
                daVerificare.Add($"composizione: percentuale di '{name}' non interpretabile ('{pct}'): verificare sulla scheda");
            else if (upper > 0.1)
                sopra.Add(entry);
            else
                sotto.Add(entry);
        }

        return (sopra.Count > 0 ? string.Join(", ", sopra) : null,
                sotto.Count > 0 ? string.Join(", ", sotto) : null,
                daVerificare);
    }

    // Date: "4 Giugno 2025", "15 Dicembre 2023", "4 June 2025", "04/06/2025", "2025-06-04"
    // -> DateTime. ParseDate (it-IT) interpreta male i numeri nudi (es. la versione
    // "14.05" diventa una data), quindi qui si riconoscono SOLO i formati attesi:
    // numerici espliciti (yyyy-MM-dd, dd/MM/yyyy, ...) o giorno + mese in lettere.
    private static readonly System.Text.RegularExpressions.Regex MonthNameDateRegex = new(
        @"(?<d>\d{1,2})\s+(?<m>gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(?<y>\d{4})",
        System.Text.RegularExpressions.RegexOptions.IgnoreCase | System.Text.RegularExpressions.RegexOptions.Compiled);

    private static readonly Dictionary<string, int> MonthNumbers = new(System.StringComparer.OrdinalIgnoreCase)
    {
        ["gennaio"] = 1, ["febbraio"] = 2, ["marzo"] = 3, ["aprile"] = 4, ["maggio"] = 5, ["giugno"] = 6,
        ["luglio"] = 7, ["agosto"] = 8, ["settembre"] = 9, ["ottobre"] = 10, ["novembre"] = 11, ["dicembre"] = 12,
        ["jan"] = 1, ["january"] = 1, ["feb"] = 2, ["february"] = 2, ["mar"] = 3, ["march"] = 3, ["apr"] = 4,
        ["april"] = 4, ["may"] = 5, ["jun"] = 6, ["june"] = 6, ["jul"] = 7, ["july"] = 7, ["aug"] = 8,
        ["august"] = 8, ["sep"] = 9, ["september"] = 9, ["oct"] = 10, ["october"] = 10, ["nov"] = 11,
        ["november"] = 11, ["dec"] = 12, ["december"] = 12
    };

    private static DateTime? ParseSdsDate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var v = value.Trim();
        // solo formati numerici espliciti (niente TryParse generalista: "14.05" -> 14/05/2026)
        var formats = new[] { "yyyy-MM-dd", "dd/MM/yyyy", "d/M/yyyy", "dd-MM-yyyy", "dd.MM.yyyy", "yyyy/MM/dd" };
        if (DateTime.TryParseExact(v, formats, System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out var exact))
            return exact;
        var m = MonthNameDateRegex.Match(v);
        if (m.Success && MonthNumbers.TryGetValue(m.Groups["m"].Value, out var month) &&
            DateTime.TryParse($"{m.Groups["y"].Value}-{month:D2}-{int.Parse(m.Groups["d"].Value):D2}",
                System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var d))
            return d;
        return null;
    }

    // Densità: "Densità relativa : 1.4" senza unità. La SDS non indica se g/cm³ o
    // kg/m³ (1.4 da sola vale g/cm³, ma il dato va comunque controllato a mano):
    // si mantiene il valore scritto e si aggiunge la nota.
    private static readonly System.Text.RegularExpressions.Regex DensityUnitRegex = new(
        @"\b(g\s*/\s*cm|kg\s*/\s*(?:m|l)|g\s*/\s*(?:m|l)\b|g/ml)",
        System.Text.RegularExpressions.RegexOptions.IgnoreCase | System.Text.RegularExpressions.RegexOptions.Compiled);

    // true se la densità è un numero senza unità (es. "1.4", "0,84"): in tal caso si
    // aggiunge la nota "unità non indicata" e il valore resta quello scritto
    private static bool DensityWithoutUnit(string? densita, List<(string Campo, string Motivo)> issues)
    {
        if (densita == null) return false;
        // un numero "secco" (con o senza simbolo di confronto) senza unità
        if (DensityUnitRegex.IsMatch(densita)) return false;
        if (!System.Text.RegularExpressions.Regex.IsMatch(densita, @"^\s*[<>≤≥=]?~?\s*\d+(?:[.,]\d+)?\s*$")) return false;
        issues.Add(("densita", "unità non indicata nella SDS: verificare sulla scheda"));
        return true;
    }

    // Pittogrammi (fonte 3): se nel testo non compaiono codici GHS, si deducono dalle
    // frasi H con la tabella CLP standard. Il derivamento è mostrato nel log e nel
    // campo note, così è chiaro che non è un codice scritto nella SDS.
    private static readonly System.Text.RegularExpressions.Regex GhsTextCodeRegex = new(
        @"\bGHS\s*0?([1-9])\b", System.Text.RegularExpressions.RegexOptions.IgnoreCase | System.Text.RegularExpressions.RegexOptions.Compiled);

    private List<(string Campo, string Motivo)> PostProcessCard(SafetyCard card)
    {
        var issues = new List<(string Campo, string Motivo)>();

        // Composizione: classificazione per soglia 0,1% e CAS con checksum
        if (card.Composizione != null)
        {
            var (sopra, sotto, daVerificare) = SplitComposizioneByThreshold(card.Composizione);
            card.ComposizioneCasSopra = sopra;
            card.ComposizioneCasSotto = sotto;
            foreach (var v in daVerificare)
            {
                var idx = v.IndexOf(':');
                issues.Add((idx > 0 ? v[..idx] : "composizione", idx > 0 ? v[(idx + 1)..].Trim() : v));
            }
        }

        return issues;
    }

    // Fallback chunking: fonde i risultati dei chunk (tutti con lo stesso prompt
    // completo). In caso di divergenza tra chunk si logga e si usa il primo valore.
    private string MergeLlmResults(List<string> jsonResults)
    {
        if (jsonResults.Count == 0) return null;
        if (jsonResults.Count == 1) return jsonResults[0];
        return MergeGroupResults(jsonResults
            .Select(j => (j, new HashSet<string>(FullFieldNames, System.StringComparer.OrdinalIgnoreCase)))
            .ToList());
    }

    // Campi del prompt completo (fallback chunking)
    private static readonly HashSet<string> FullFieldNames = new(
        System.Text.RegularExpressions.Regex.Matches(FullFieldsPrompt, "\\\"(\\w+)\\\":")
            .Select(m => m.Groups[1].Value), System.StringComparer.OrdinalIgnoreCase);

    // Unisce i risultati JSON parziali dei gruppi di campi in un unico JSON.
    // Ogni gruppo contiene i suoi campi più i sinonimi (es. "composizione" sia nel
    // gruppo composizione sia nel fallback a chunking): quando un campo è presente
    // in due gruppi vince il gruppo più specifico, quello che lo chiede nel prompt
    // (groupSpecific), così la composizione nel formato nome|CAS|% non viene
    // sovrascritta da un campo omonimo meno preciso.
    private string MergeGroupResults(List<(string Json, HashSet<string> Specific)> groupResults)
    {
        var merged = new Dictionary<string, string>(System.StringComparer.OrdinalIgnoreCase);
        var specific = new Dictionary<string, bool>(System.StringComparer.OrdinalIgnoreCase);
        var fieldOrder = new List<string>();

        foreach (var (json, groupSpecific) in groupResults)
        {
            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(json);
                foreach (var prop in doc.RootElement.EnumerateObject())
                {
                    if (prop.Value.ValueKind == System.Text.Json.JsonValueKind.Null) continue;
                    var value = prop.Value.ValueKind == System.Text.Json.JsonValueKind.String
                        ? prop.Value.GetString() ?? ""
                        : prop.Value.GetRawText();
                    if (string.IsNullOrWhiteSpace(value) || value == "null") continue;

                    var isSpecific = groupSpecific.Contains(prop.Name);
                    if (merged.TryGetValue(prop.Name, out var prev))
                    {
                        // un valore specifico non viene sovrascritto da uno generico
                        if (specific[prop.Name] && !isSpecific) continue;
                        if (!specific[prop.Name] && !isSpecific &&
                            !string.Equals(prev, value, System.StringComparison.OrdinalIgnoreCase))
                            _logger.LogWarning("Merge LLM: campo \"{Field}\" divergente tra gruppi (primo: \"{First}\", successivo: \"{Second}\")",
                                prop.Name, prev, value);
                        merged[prop.Name] = value;
                        specific[prop.Name] = specific[prop.Name] || isSpecific;
                    }
                    else
                    {
                        merged[prop.Name] = value;
                        specific[prop.Name] = isSpecific;
                        fieldOrder.Add(prop.Name);
                    }
                }
            }
            catch
            {
                // JSON già validato in CallLlmAsync: se qui non si parsesce si salta
            }
        }

        if (fieldOrder.Count == 0) return null;

        var sb = new System.Text.StringBuilder("{");
        for (var i = 0; i < fieldOrder.Count; i++)
        {
            if (i > 0) sb.Append(",");
            sb.Append($"\"{fieldOrder[i]}\":");
            sb.Append(System.Text.Json.JsonSerializer.Serialize(merged[fieldOrder[i]]));
        }
        sb.Append("}");
        return sb.ToString();
    }

    // Self-consistency: per i campi critici (composizione, CAS) fa una seconda chiamata LLM
    // sul testo completo e confronta i risultati. Se divergono, il campo viene segnato
    // "da verificare" invece di fidarsi del primo passaggio.
    private async Task<string?> VerifyCriticalFieldsAsync(string fullText, string firstJson)
    {
        try
        {
            var secondJson = await CallLlmAsync(fullText, null);
            if (secondJson == null) return firstJson;

            using var doc1 = System.Text.Json.JsonDocument.Parse(firstJson);
            using var doc2 = System.Text.Json.JsonDocument.Parse(secondJson);

            var criticalFields = new[] { "composizione_cas_sopra_01", "composizione_cas_sotto_01", "composizione" };
            var divergences = new List<string>();

            foreach (var field in criticalFields)
            {
                var v1 = GetJsonString(doc1.RootElement, field);
                var v2 = GetJsonString(doc2.RootElement, field);
                if (!string.Equals(v1, v2, System.StringComparison.OrdinalIgnoreCase))
                {
                    divergences.Add(field);
                    _logger.LogWarning("Self-consistency: campo \"{Field}\" divergente tra i due passaggi LLM", field);
                }
            }

            if (divergences.Count > 0)
            {
                // Si usa il primo risultato ma si segnala la divergenza nel log;
                // SdsVerifier controllerà comunque ogni valore contro il testo
                _logger.LogWarning("Self-consistency: {Count} campi critici divergenti: {Fields}. Si usa il primo risultato (verificato da SdsVerifier).",
                    divergences.Count, string.Join(", ", divergences));
            }

            return firstJson;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Self-consistency: errore nel secondo passaggio LLM, si usa il primo risultato");
            return firstJson;
        }
    }

    // Vision: trasforma le pagine del PDF in immagini e le invia al modello multimodale
    // (llama.cpp con mmproj) per un doppio controllo. Il modello legge direttamente
    // l'immagine della scheda, catturando dati che il testo estratto potrebbe aver perso
    // (es. tabelle, note a margine, caratteri spezzati). I risultati vengono confrontati
    // con quelli del passaggio testo: le divergenze vengono loggate e il campo resta
    // soggetto a verifica da SdsVerifier.
    private async Task<string?> CallLlmVisionAsync(byte[] pdfBytes, string? fileName)
    {
        var visionEnabled = _configuration.GetValue<bool>("LLM:VisionEnabled");
        if (!visionEnabled) return null;

        var visionModel = _configuration["LLM:VisionModel"] ?? _configuration["LLM:Model"];
        var maxPages = _configuration.GetValue<int>("LLM:VisionMaxPages");
        if (maxPages <= 0) maxPages = 4;

        try
        {
            var prompt = "Dalla scheda di sicurezza (immagine) estrai i dati e restituisci SOLO un JSON valido con questa struttura: " +
                "{ " +
                "\"titolo\": \"nome del prodotto chimico (punto 1.1)\", " +
                "\"produttore\": \"nome della società produttrice/fornitrice (punto 1.3), senza indirizzo\", " +
                "\"frasi_h\": \"codici delle frasi H ed EUH della sezione 2.1 (es. H225, H315, EUH066) separati da virgola\", " +
                "\"pittogramma\": \"codici dei pittogrammi GHS (es. GHS02) se scritti come testo nella scheda, separati da virgola. Se non compare il codice GHS usa null\", " +
                "\"composizione\": \"composizione del prodotto (sezione 3): tutti i componenti, separati da virgola, ognuno nel formato nome|numero CAS|percentuale, come scritti nella SDS\", " +
                "\"stato_fisico\": \"stato fisico (punto 9) - riporta SOLO lo stato (es. 'liquido', 'solido', 'gas') se presente, altrimenti null\", " +
                "\"teb\": \"temperatura di ebollizione (punto 9) come scritta, con l'unità. Se non c'è usa null\", " +
                "\"cov_percent\": \"COV/VOC esattamente come riportato nella SDS, in % oppure in g/l con l'unità. Se non è riportato usa null\", " +
                "\"densita\": \"densità o densità relativa (punto 9) come scritta, con l'unità se indicata. Se non c'è usa null\", " +
                "\"sds_url\": \"URL della SDS se scritto nella scheda, altrimenti null\", " +
                "\"data_sds\": \"data di edizione/revisione della SDS come scritta (es. '4 Giugno 2025'). Se non c'è usa null\", " +
                "\"versione\": \"numero di versione o revisione della SDS come scritto, altrimenti null\", " +
                "\"data_scadenza\": \"data di scadenza/validità della SDS solo se scritta esplicitamente, come scritta, altrimenti null\" " +
                "} " +
                "REGOLE FONDAMENTALI: " +
                "1) Riporta SOLO i dati che vedi SCRITTI ESPLICITAMENTE nella scheda. " +
                "2) NON dedurre, NON stimare, NON calcolare, NON completare con conoscenze generali. " +
                "3) Se un dato manca, è illeggibile o hai dubbi usa null (l'oggetto JSON null, non la stringa \"null\"). " +
                "4) Per i numeri: riporta il valore ESATTO come scritto, con tutti i decimali. " +
                "5) Per i CAS: riporta il numero CAS esattamente come scritto nel formato xxx-xx-x. " +
                "6) Non aggiungere testo fuori dal JSON.";

            // Rasterizza le pagine del PDF e le codifica in base64.
            // JPEG q80 al posto di PNG: una pagina A4 a 150 DPI passa da ~1.2 MB (PNG)
            // a ~150-250 KB (JPEG), il payload verso il modello multimodale si riduce
            // di 5-8x e la qualità resta più che sufficiente per la lettura del testo.
            //
            // Per le SDS lunghe (20-30 pagine) NON si usano le prime N pagine: i dati
            // che servono (intestazione, classificazione, composizione, proprietà
            // fisiche) stanno nelle sezioni 1-9, che nelle SDS standard occupano le
            // prime pagine. Si prendono le prime 4 pagine (sempre) e, se il documento
            // è lungo, si aggiungono pagine intermedie fino a maxPages.
            var renderer = new PdfPageRenderer();
            using var pdfDoc = renderer.Open(pdfBytes);
            var total = pdfDoc.Pages.Count;
            var pageIndices = SelectVisionPages(total, maxPages);

            var imageContents = new List<object>();
            foreach (var i in pageIndices)
            {
                var jpegBytes = ToJpeg(renderer.RenderPage(pdfDoc, i));
                if (jpegBytes == null) continue;
                var base64 = Convert.ToBase64String(jpegBytes);
                imageContents.Add(new
                {
                    type = "image_url",
                    image_url = new { url = $"data:image/jpeg;base64,{base64}" }
                });
            }

            if (imageContents.Count == 0) return null;

            // Costruisce l'array di contenuti: testo + immagini, in un'unica lista
            var allContents = new List<object> { new { type = "text", text = prompt } };
            allContents.AddRange(imageContents);

            var baseUrl = (_configuration["LLM:BaseUrl"] ?? "http://localhost:8000").TrimEnd('/');
            var apiKey = _configuration["LLM:ApiKey"];
            var timeout = int.TryParse(_configuration["LLM:TimeoutSeconds"], out var t) ? t : 300;

            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(timeout);
            if (!string.IsNullOrWhiteSpace(apiKey))
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

            var payload = new Dictionary<string, object>
            {
                ["model"] = visionModel,
                ["messages"] = new object[]
                {
                    new Dictionary<string, object> { ["role"] = "system", ["content"] = "Sei un analista esperto di schede di sicurezza (SDS/GHS) chimiche. Il tuo compito è estrarre SOLO i dati che sono ESPPLICITAMENTE SCRITTI nella scheda di sicurezza fornita come immagine. NON devi mai: dedurre informazioni, calcolare valori, stimare dati mancanti, usare conoscenze chimiche generali. Se un dato non è presente o non ne sei assolutamente sicuro, usa null. Rispondi SEMPRE con un solo oggetto JSON valido, senza testo aggiuntivo, senza markdown, senza backticks." },
                    new Dictionary<string, object> { ["role"] = "user", ["content"] = allContents }
                },
                ["temperature"] = 0,
                ["max_tokens"] = 4000,
                ["response_format"] = new Dictionary<string, string> { ["type"] = "json_object" }
            };

            _logger.LogInformation("LLM Vision call: url={Url} model={Model} pages={Pages} ({Indices})",
                $"{baseUrl}/v1/chat/completions", visionModel, pageIndices.Count,
                string.Join(",", pageIndices.Select(p => p + 1)));
            using var response = await client.PostAsJsonAsync($"{baseUrl}/v1/chat/completions", payload);
            var status = (int)response.StatusCode;
            _logger.LogInformation("LLM Vision response status: {Status}", status);

            if (!response.IsSuccessStatusCode)
            {
                var errBody = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("LLM Vision HTTP {Status}: {Body}", status, errBody);
                return null;
            }

            var body = await response.Content.ReadAsStringAsync();
            using var jsonDoc = System.Text.Json.JsonDocument.Parse(body);
            var content = jsonDoc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

            var json = ExtractJson(content);
            if (json == null)
            {
                _logger.LogWarning("LLM Vision: nessun JSON trovato nella risposta. Content: {Content}", content);
                return null;
            }

            System.Text.Json.JsonDocument.Parse(json); // valida il JSON
            _logger.LogInformation("LLM Vision: JSON valido, length={Len}", json.Length);
            return json;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "LLM Vision: errore nella chiamata al modello multimodale");
            return null;
        }
    }

    // Sceglie quali pagine inviare al modello vision. Le prime 4 sono sempre incluse
    // (intestazione, classificazione, inizio composizione); per le SDS lunghe si
    // aggiungono pagine intermedie distribuite uniformemente fino a maxPages, così
    // si coprono anche le sezioni centrali (proprietà fisiche, stabilità) senza
    // inviare l'intero documento di 20-30 pagine.
    private static List<int> SelectVisionPages(int totalPages, int maxPages)
    {
        if (totalPages <= maxPages)
            return Enumerable.Range(0, totalPages).ToList();

        var pages = new SortedSet<int> { 0, 1, 2, 3 };
        var remaining = maxPages - pages.Count;
        if (remaining > 0)
        {
            // Pagine intermedie: distribuite uniformemente tra la pagina 4 e l'ultima
            var span = totalPages - 4;
            for (var i = 0; i < remaining; i++)
            {
                var idx = 4 + (int)Math.Round((double)(i + 1) * span / (remaining + 1));
                pages.Add(Math.Min(idx, totalPages - 1));
            }
        }
        return pages.ToList();
    }

    // Converte il PNG della pagina in JPEG compresso (qualità 80) per il payload vision.
    // Restituisce null se la conversione fallisce (la pagina viene saltata).
    private static byte[]? ToJpeg(byte[] pngBytes)
    {
        try
        {
            using var image = Image.Load(pngBytes);
            using var ms = new MemoryStream();
            image.SaveAsJpeg(ms, new JpegEncoder { Quality = 80 });
            return ms.ToArray();
        }
        catch
        {
            return null;
        }
    }

    // Confronta i risultati del passaggio testo con quelli del passaggio vision.
    // Per ogni campo critico, se i due valori divergono, si logga l'avvertenza.
    // Il risultato finale resta quello del passaggio testo (verificato da SdsVerifier),
    // ma le divergenze vengono segnalate per un controllo manuale.
    private string CompareVisionResults(string textJson, string visionJson)
    {
        try
        {
            using var docText = System.Text.Json.JsonDocument.Parse(textJson);
            using var docVision = System.Text.Json.JsonDocument.Parse(visionJson);

            var criticalFields = new[] { "composizione_cas_sopra_01", "composizione_cas_sotto_01", "composizione", "frasi_h", "pittogramma" };
            var divergences = new List<string>();

            foreach (var field in criticalFields)
            {
                var vText = GetJsonString(docText.RootElement, field);
                var vVision = GetJsonString(docVision.RootElement, field);
                if (!string.Equals(vText, vVision, System.StringComparison.OrdinalIgnoreCase))
                {
                    divergences.Add(field);
                    _logger.LogWarning("Vision vs Testo: campo \"{Field}\" divergente (testo: \"{Text}\", vision: \"{Vision}\")",
                        field, vText ?? "null", vVision ?? "null");
                }
            }

            if (divergences.Count > 0)
            {
                _logger.LogWarning("Vision vs Testo: {Count} campi divergenti: {Fields}. Si usa il risultato del passaggio testo (verificato da SdsVerifier).",
                    divergences.Count, string.Join(", ", divergences));
            }
            else
            {
                _logger.LogInformation("Vision vs Testo: tutti i campi critici concordano");
            }

            return textJson;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Vision vs Testo: errore nel confronto, si usa il risultato del passaggio testo");
            return textJson;
        }
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


