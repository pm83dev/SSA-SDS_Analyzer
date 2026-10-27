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

// Flusso di importazione PDF semplificato:
// 1. estrae il testo nativo dal PDF (PdfPig)
// 2. invia il testo a un'unica chiamata LLM con un prompt completo
// 3. salva la scheda con i campi restituiti dal modello
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
                throw new Exception("File non valido: mancano le colonne 'ID CLIENTE' e 'Nome prodotto chimico'");

            var clients = await _context.Clients.ToDictionaryAsync(c => c.Id);
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
        var existing = await _context.SafetyCards.Include(sc => sc.Clients)
            .FirstOrDefaultAsync(sc => sc.PdfHash == pdfHash);
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
            result.Message = "Il PDF non contiene testo estraibile (probabilmente è una scansione): non gestita in questa versione";
            return result;
        }

        pdfBuffer.Position = 0; // CallLlmAsync legge il PDF per il rendering delle pagine (vision)
        
        // Divide il testo nelle sezioni e fa chiamate LLM separate per ogni sezione
        var sections = SplitSdsSections(text);
        var sectionResults = new Dictionary<string, string?>();
        
        // Chiamate parallele per ogni sezione disponibile
        var tasks = new List<Task<(string SectionKey, string? Json)>>();
        
        if (sections.ContainsKey("section1"))
            tasks.Add(CallLlmForSectionAsync(Section1Prompt, sections["section1"], fileName, pdfBuffer));
        if (sections.ContainsKey("section2"))
            tasks.Add(CallLlmForSectionAsync(Section2Prompt, sections["section2"], fileName, pdfBuffer));
        if (sections.ContainsKey("section3"))
            tasks.Add(CallLlmForSectionAsync(Section3Prompt, sections["section3"], fileName, pdfBuffer));
        if (sections.ContainsKey("section9"))
            tasks.Add(CallLlmForSectionAsync(Section9Prompt, sections["section9"], fileName, pdfBuffer));
        
        // Se nessuna sezione trovata, usa il prompt completo sul testo intero
        if (tasks.Count == 0)
        {
            var json = await CallLlmAsync(text, fileName, pdfBuffer);
            if (json == null)
            {
                result.Message = "Il servizio LLM non ha restituito una risposta valida. Verifica che il server LLM sia raggiungibile.";
                return result;
            }
            sectionResults["full"] = json;
        }
        else
        {
            var completedTasks = await Task.WhenAll(tasks);
            foreach (var (sectionKey, json) in completedTasks)
                sectionResults[sectionKey] = json;
            
            // Verifica che almeno una chiamata abbia avuto successo
            if (!sectionResults.Values.Any(j => j != null))
            {
                result.Message = "Il servizio LLM non ha restituito una risposta valida per nessuna sezione. Verifica che il server LLM sia raggiungibile.";
                return result;
            }
        }

        // Unisce i risultati delle chiamate LLM per sezione in un unico JSON
        var mergedJson = MergeSectionResults(sectionResults);
        
        var card = new SafetyCard
        {
            Tipologia = "SDS",
            NomeFileImportato = fileName,
            PdfHash = pdfHash,
            LlmAnalyzed = true,
            LlmRawResponse = mergedJson,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        try
        {
            using var doc = System.Text.Json.JsonDocument.Parse(mergedJson);
            var root = doc.RootElement;

            card.Titolo = NormalizeMissing(GetJsonString(root, "titolo", "nome_prodotto", "product_name")) ?? string.Empty;
            card.EnteEmittitore = NormalizeMissing(GetJsonString(root, "produttore", "ente_emittitore", "producer"));
            card.NumeroProtocollo = NormalizeMissing(GetJsonString(root, "versione", "revisione", "version"));
            card.DataRilascio = ParseSdsDate(GetJsonString(root, "data_sds", "data_revisione", "sds_date"));
            card.DataScadenza = ParseSdsDate(GetJsonString(root, "data_scadenza", "expiry_date"));
            card.FrasiH = NormalizeMissing(GetJsonString(root, "frasi_h", "h_phrases"));
            // Il modello restituisce array (come in Open WebUI): uniti con virgola per il campo testo della scheda.
            // Se la SDS non riporta i codici GHS nella sezione 2.2 (array vuoto), li deriva dalle frasi H (CLP).
            var existingPictograms = GetJsonArray(root, "pittogrammi", "pittogramma", "pictogram");
            card.Pittogrammi = NormalizeMissing(string.Join(", ", existingPictograms));
            
            // Se non ci sono pittogrammi nella sezione 2.2, li deriva dalle frasi H (CLP)
            if (existingPictograms.Count == 0)
            {
                var derived = GhsMapping.DeriveGhsCodes(card.FrasiH);
                if (derived.Count > 0)
                {
                    card.Pittogrammi = string.Join(", ", derived);
                    _logger.LogInformation("PDF {FileName}: pittogrammi derivati dalle frasi H: {Pictograms}", fileName, card.Pittogrammi);
                }
            }
            // Se ci sono pittogrammi nella sezione 2.2 ma anche frasi H, controlla che non ci siano discrepanze
            else if (!string.IsNullOrWhiteSpace(card.FrasiH))
            {
                var derived = GhsMapping.DeriveGhsCodes(card.FrasiH);
                if (derived.Count > 0)
                {
                    // Verifica se i pittogrammi derivati sono già presenti nei pittogrammi esistenti
                    var existingSet = new HashSet<string>(existingPictograms.Select(p => p.Trim()), StringComparer.OrdinalIgnoreCase);
                    var derivedSet = new HashSet<string>(derived, StringComparer.OrdinalIgnoreCase);
                    
                    // Se ci sono discrepanze tra i due set, logga un avviso ma usa i pittogrammi esistenti
                    if (!existingSet.IsSubsetOf(derivedSet) && !derivedSet.IsSubsetOf(existingSet))
                    {
                        _logger.LogWarning("PDF {FileName}: discrepanza tra pittogrammi presenti nella SDS ({Existing}) e quelli derivati dalle frasi H ({Derived})", 
                            fileName, string.Join(", ", existingPictograms), string.Join(", ", derived));
                    }
                }
            }
            card.ComposizioneCasSopra = NormalizeMissing(string.Join(", ", GetJsonArray(root, "composizione_cas_sopra_01", "composition_cas_above")));
            card.ComposizioneCasSotto = NormalizeMissing(string.Join(", ", GetJsonArray(root, "composizione_cas_sotto_01", "composition_cas_below")));
            // I CAS da verificare (leggibilità incerta) vanno segnalati nella composizione, non persi
            var casDaVerificare = GetJsonArray(root, "composizione_cas_da_verificare");
            if (casDaVerificare.Count > 0)
                _logger.LogInformation("PDF {FileName}: CAS da verificare: {Cas}", fileName, string.Join("; ", casDaVerificare));
            card.Composizione = NormalizeMissing(GetJsonString(root, "composizione", "composition"));
            card.StatoFisico = NormalizeMissing(GetJsonString(root, "stato_fisico", "physical_state"));
            card.TemperaturaEbollizione = NormalizeMissing(GetJsonString(root, "teb", "punto_di_ebollizione", "boiling_point"));
            card.CovPercent = NormalizeMissing(GetJsonString(root, "cov_percent", "voc_percent", "vocs"));
            card.Densita = NormalizeMissing(GetJsonString(root, "densita"));
            card.SdsUrl = NormalizeMissing(GetJsonString(root, "sds_url"));

            var llmDiisocianati = ParseYesNo(NormalizeMissing(GetJsonString(root, "diisocianati")));
            var detected = DetectDiisocyanates(card.Composizione, card.ComposizioneCasSopra, card.ComposizioneCasSotto);
            if (detected == true) card.ContieneDiisocianati = true;
            else if (llmDiisocianati != null) card.ContieneDiisocianati = llmDiisocianati.Value;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Errore nel parsing della risposta LLM: {Json}", mergedJson);
            result.Message = "La risposta del servizio LLM non è un JSON valido";
            return result;
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
        result.Message = card.PdfUrl != null
            ? $"Scheda \"{card.Titolo}\" creata con PDF allegato"
            : $"Scheda \"{card.Titolo}\" creata (PDF non allegato)";
        result.Card = SafetyCardDto.From(card);

        _context.ImportHistories.Add(new ImportHistory
        {
            FileName = fileName ?? "pdf-llm",
            FileType = "Pdf",
            ClientId = clientId,
            RecordsImported = 1,
            Status = "Success",
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        return result;
    }

    // Estrazione del testo con l'analisi di layout (Docstrum): le parole sono raggruppate in
    // righe e blocchi secondo la loro posizione nella pagina, così le colonne delle tabelle
    // non vengono incollate come con page.Text. Le righe di ogni blocco sono unite con uno spazio.
    private string ExtractPdfText(Stream pdfStream)
    {
        using var ms = new MemoryStream();
        pdfStream.CopyTo(ms);
        ms.Position = 0;
        using var doc = UglyToad.PdfPig.PdfDocument.Open(ms);

        // Prima passata: raccoglie le righe di ogni pagina (in ordine di layout).
        var pageLines = new List<List<string>>();
        foreach (var page in doc.GetPages())
        {
            var words = page.GetWords(UglyToad.PdfPig.DocumentLayoutAnalysis.WordExtractor.NearestNeighbourWordExtractor.Instance);
            var blocks = UglyToad.PdfPig.DocumentLayoutAnalysis.PageSegmenter.DocstrumBoundingBoxes.Instance.GetBlocks(words);
            var lines = new List<string>();
            foreach (var block in blocks)
                foreach (var line in block.TextLines)
                {
                    var text = string.Join(" ", line.Words.Select(w => w.Text)).Trim();
                    if (text.Length > 0) lines.Add(text);
                }
            pageLines.Add(lines);
        }

        // Seconda passata: unisce le righe spezzate a cavallo di due pagine consecutive.
        // Una voce di tabella (es. un componente chimico nel punto 3) può finire in fondo a una
        // pagina e continuare sulla successiva: se la prima riga della nuova pagina è una
        // "continuazione" (minuscola/parentesi/cifra, non un'intestazione) la si incolla
        // all'ultima riga della pagina precedente. Si opera su una copia per non mutare pageLines.
        var mergedPages = new List<List<string>>(pageLines.Count);
        for (var i = 0; i < pageLines.Count; i++)
        {
            var lines = new List<string>(pageLines[i]);
            if (i > 0 && lines.Count > 0 && mergedPages[i - 1].Count > 0 && IsContinuationOf(lines[0]))
            {
                var prev = mergedPages[i - 1];
                var merged = prev[^1] + " " + lines[0];
                lines.RemoveAt(0);
                prev[^1] = merged; // aggiorna l'ultima riga della pagina precedente (già copiata)
            }
            mergedPages.Add(lines);
        }

        var sb = new System.Text.StringBuilder();
        foreach (var lines in mergedPages)
        {
            foreach (var line in lines) sb.AppendLine(line);
            sb.AppendLine();
        }

        return NormalizePdfText(sb.ToString());
    }

    // Una riga è una "continuazione" se inizia con minuscola/parentesi/chiffra e non assomiglia a un'intestazione.
    private static bool IsContinuationOf(string line)
    {
        if (line.Length == 0) return false;
        // Inizia con maiuscola: probabilmente nuova voce/intestazione, non continuazione
        if (char.IsUpper(line[0])) return false;
        // Intestazioni di pagina/sezione ("Pagina 2 di 5", "3. Composizione...", ecc.)
        if (System.Text.RegularExpressions.Regex.IsMatch(line, @"^(pag\.?|page)\b", System.Text.RegularExpressions.RegexOptions.IgnoreCase)) return false;
        if (System.Text.RegularExpressions.Regex.IsMatch(line, @"^\d+(\.\d+)*\s+[A-Z]")) return false;
        // Minuscola, parentesi, cifra o trattino: continuazione di una voce spezzata
        var c = line[0];
        return char.IsLetter(c) || c is '(' or ')' or '[' or ']' or '-' or ',' or ';' || char.IsDigit(c);
    }

    // Pulizia del testo estratto dal PDF: rimuove i caratteri invisibili che i PDF con font
    // embedded inseriscono (zero-width, soft-hyphen, BOM) e normalizza gli spazi multipli.
    private static string NormalizePdfText(string text)
    {
        if (string.IsNullOrEmpty(text)) return text;
        var cleaned = text
            .Replace("\u200B", "")  // zero-width space
            .Replace("\u200C", "")  // zero-width non-joiner
            .Replace("\u200D", "")  // zero-width joiner
            .Replace("\uFEFF", "")  // BOM / zero-width no-break space
            .Replace("\u00AD", ""); // soft hyphen
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @"[\t\r\f\v\u0000-\u0008\u000E-\u001F\u007F\u200E\u200F]", " ");
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @"[ ]+", " ");
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @" ?\n ?\n ?", "\n\n");
        cleaned = System.Text.RegularExpressions.Regex.Replace(cleaned, @"\n{3,}", "\n\n");
        return cleaned.Trim();
    }

    // Divide il testo della SDS nelle sezioni principali (1, 2, 3, 9) usando i pattern delle intestazioni.
    // Ritorna una dictionary con le chiavi "section1", "section2", "section3", "section9".
    private static Dictionary<string, string> SplitSdsSections(string text)
    {
        var sections = new Dictionary<string, string>();
        
        // Pattern per trovare l'inizio di ogni sezione principale
        var sectionPatterns = new Dictionary<string, System.Text.RegularExpressions.Regex>
        {
            ["section1"] = new System.Text.RegularExpressions.Regex(@"^\s*1\.\s+[A-Z]", System.Text.RegularExpressions.RegexOptions.Multiline),
            ["section2"] = new System.Text.RegularExpressions.Regex(@"^\s*2\.\s+[A-Z]", System.Text.RegularExpressions.RegexOptions.Multiline),
            ["section3"] = new System.Text.RegularExpressions.Regex(@"^\s*3\.\s+[A-Z]", System.Text.RegularExpressions.RegexOptions.Multiline),
            ["section9"] = new System.Text.RegularExpressions.Regex(@"^\s*9\.\s+[A-Z]", System.Text.RegularExpressions.RegexOptions.Multiline)
        };
        
        // Trova la posizione di inizio di ogni sezione
        var positions = new Dictionary<string, int>();
        foreach (var kvp in sectionPatterns)
        {
            var match = kvp.Value.Match(text);
            if (match.Success)
                positions[kvp.Key] = match.Index;
        }
        
        // Estrae il contenuto di ogni sezione (dall'inizio alla sezione successiva)
        var orderedKeys = new[] { "section1", "section2", "section3", "section9" };
        for (var i = 0; i < orderedKeys.Length; i++)
        {
            var key = orderedKeys[i];
            if (!positions.ContainsKey(key)) continue;
            
            var start = positions[key];
            int end;
            
            // Trova la sezione successiva per determinare la fine di questa
            var nextKey = orderedKeys.FirstOrDefault(k => k != key && positions.ContainsKey(k) && positions[k] > start);
            if (nextKey != null)
                end = positions[nextKey];
            else
                end = text.Length;
            
            sections[key] = text[start..end].Trim();
        }
        
        return sections;
    }

    // Prompt specifici per ogni sezione della SDS, per un'analisi più precisa.
    
    // Sezione 1: Identificazione del prodotto (punti 1.1 e 1.3)
    private const string Section1Prompt =
        "Dal testo della SEZIONE 1 della SDS estrai i dati e restituisci SOLO un JSON valido con questa struttura: " +
        "{ " +
        "\"titolo\": \"nome del prodotto chimico (punto 1.1)\", " +
        "\"produttore\": \"nome della società produttrice/fornitrice (punto 1.3), senza indirizzo\", " +
        "\"sds_url\": \"URL della SDS se scritto nel testo, altrimenti null\", " +
        "\"data_sds\": \"data di compilazione/revisione della SDS come scritta (es. '2025-06-04'), se scritta, altrimenti null\", " +
        "\"versione\": \"numero di versione o revisione della SDS come scritto, altrimenti null\", " +
        "\"data_scadenza\": \"data di scadenza/validità della SDS solo se scritta esplicitamente, come scritta, altrimenti null\" " +
        "} " +
        "REGOLE: " +
        "1) Riporta i dati che trovi nel testo. " +
        "2) Se un dato manca usa null (l'oggetto JSON null, non la stringa \"null\"). " +
        "3) Non aggiungere testo fuori dal JSON.";

    // Sezione 2: Informazioni sulla pericolosità (punti 2.1 e 2.2)
    private const string Section2Prompt =
        "Dal testo della SEZIONE 2 della SDS estrai i dati e restituisci SOLO un JSON valido con questa struttura: " +
        "{ " +
        "\"frasi_h\": \"codici delle frasi H e EUH della sezione 2.1 (es. H225, H315, EUH066) separati da virgola. Se nella SDS c'è solo la descrizione della frase H, riporta il codice corrispondente. Le frasi R (es. R35) non sono frasi H: non riportarle\", " +
        "\"pittogrammi\": [\"codici dei pittogrammi GHS scritti nella sezione 2.2, es. 'GHS02', 'GHS07'. Se nel testo non compare il codice GHS usa un array vuoto: non dedurlo dalle frasi H o dai simboli\"] " +
        "} " +
        "REGOLE: " +
        "1) Riporta i dati che trovi nel testo. " +
        "2) Se un dato manca usa null (l'oggetto JSON null, non la stringa \"null\"); per gli array usa un array vuoto []. " +
        "3) Non aggiungere testo fuori dal JSON.";

    // Sezione 3: Composizione/informazioni sugli ingredienti
    private const string Section3Prompt =
        "Dal testo della SEZIONE 3 della SDS estrai i dati e restituisci SOLO un JSON valido con questa struttura: " +
        "{ " +
        "\"composizione_cas_sopra_01\": [\"componenti con CAS sopra lo 0,1% (punto 3), uno per voce, nel formato 'nome numero CAS' (es. 'xilene 1330-20-7'). Il n. CAS ha il formato xxx-xx-x: NON usare il numero CE/EC né il numero indice CLP. Se non ci sono componenti usa un array vuoto\"], " +
        "\"composizione_cas_sotto_01\": [\"componenti con CAS sotto lo 0,1% (punto 3), uno per voce, nel formato 'nome numero CAS'. Se non ci sono componenti usa un array vuoto\"], " +
        "\"composizione_cas_da_verificare\": [\"componenti il cui numero CAS non riesci a leggere con certezza o che compaiono senza CAS: riporta la voce come scritta (es. '911674-82-3 <1,0%'). Se non ce ne sono usa un array vuoto\"], " +
        "\"composizione\": \"elenco dei nomi dei componenti chimici presenti nella SDS, separati da virgola\", " +
        "\"diisocianati\": \"'sì' se la SDS dichiara la presenza di diisocianati (punto 3 o 14), 'no' se dichiara l'assenza o non contiene diisocianati\" " +
        "} " +
        "REGOLE: " +
        "1) Riporta i dati che trovi nel testo. " +
        "2) Se un dato manca usa null (l'oggetto JSON null, non la stringa \"null\"); per gli array usa un array vuoto []. " +
        "3) Per i CAS: riporta il numero CAS esattamente come scritto nel formato xxx-xx-x; se non lo leggi con certezza metti la voce in composizione_cas_da_verificare. " +
        "4) I diisocianati sono riconoscibili perché la desinenza 'diiso' o 'di-iso' c'è sempre nei nomi chimici. " +
        "5) Non aggiungere testo fuori dal JSON.";

    // Sezione 9: Proprietà fisiche e chimiche
    private const string Section9Prompt =
        "Dal testo della SEZIONE 9 della SDS estrai i dati e restituisci SOLO un JSON valido con questa struttura: " +
        "{ " +
        "\"stato_fisico\": \"stato fisico (punto 9) - riporta SOLO lo stato (es. 'liquido', 'solido', 'gas') se presente nel testo, altrimenti null\", " +
        "\"teb\": \"temperatura di ebollizione (punto 9) come scritta, con l'unità (es. '>37,78 °C'). Se non c'è usa null\", " +
        "\"cov_percent\": \"COV/VOC esattamente come riportato nella SDS, in % oppure in g/l con l'unità (es. '650 g/l'). Se non è riportato usa null: non stimarlo e non calcolarlo\", " +
        "\"densita\": \"densità (punto 9) come scritta (es. '1,4', '0,84 g/cm³'). Se non c'è usa null\" " +
        "} " +
        "REGOLE: " +
        "1) Riporta i dati che trovi nel testo. " +
        "2) Se un dato manca usa null (l'oggetto JSON null, non la stringa \"null\"). " +
        "3) Per i numeri (temperature, percentuali, densità): riporta il valore ESATTO come scritto, con tutti i decimali. Non arrotondare. " +
        "4) Non aggiungere testo fuori dal JSON.";

    // Prompt completo: un'unica chiamata LLM su tutto il testo della SDS.
    // Lo schema JSON è identico a quello usato con successo in Open WebUI (stesso modello):
    // array per pittogrammi e composizione, campo diisocianati sì/no.
    private const string FullFieldsPrompt =
        "Dal testo della SDS estrai i dati e restituisci SOLO un JSON valido con questa struttura: " +
        "{ " +
        "\"titolo\": \"nome del prodotto chimico (punto 1.1)\", " +
        "\"produttore\": \"nome della società produttrice/fornitrice (punto 1.3), senza indirizzo\", " +
        "\"sds_url\": \"URL della SDS se scritto nel testo, altrimenti null\", " +
        "\"frasi_h\": \"codici delle frasi H e EUH della sezione 2.1 (es. H225, H315, EUH066) separati da virgola. Se nella SDS c'è solo la descrizione della frase H, riporta il codice corrispondente. Le frasi R (es. R35) non sono frasi H: non riportarle\", " +
        "\"pittogrammi\": [\"codici dei pittogrammi GHS scritti nella sezione 2.2, es. 'GHS02', 'GHS07'. Se nel testo non compare il codice GHS usa un array vuoto: non dedurlo dalle frasi H o dai simboli\"], " +
        "\"composizione_cas_sopra_01\": [\"componenti con CAS sopra lo 0,1% (punto 3), uno per voce, nel formato 'nome numero CAS' (es. 'xilene 1330-20-7'). Il n. CAS ha il formato xxx-xx-x: NON usare il numero CE/EC né il numero indice CLP. Se non ci sono componenti usa un array vuoto\"], " +
        "\"composizione_cas_sotto_01\": [\"componenti con CAS sotto lo 0,1% (punto 3), uno per voce, nel formato 'nome numero CAS'. Se non ci sono componenti usa un array vuoto\"], " +
        "\"composizione_cas_da_verificare\": [\"componenti il cui numero CAS non riesci a leggere con certezza o che compaiono senza CAS: riporta la voce come scritta (es. '911674-82-3 <1,0%'). Se non ce ne sono usa un array vuoto\"], " +
        "\"stato_fisico\": \"stato fisico (punto 9) - riporta SOLO lo stato (es. 'liquido', 'solido', 'gas') se presente nel testo, altrimenti null\", " +
        "\"teb\": \"temperatura di ebollizione (punto 9) come scritta, con l'unità (es. '>37,78 °C'). Se non c'è usa null\", " +
        "\"cov_percent\": \"COV/VOC esattamente come riportato nella SDS, in % oppure in g/l con l'unità (es. '650 g/l'). Se non è riportato usa null: non stimarlo e non calcolarlo\", " +
        "\"densita\": \"densità (punto 9) come scritta (es. '1,4', '0,84 g/cm³'). Se non c'è usa null\", " +
        "\"data_sds\": \"data di compilazione/revisione della SDS come scritta (es. '2025-06-04'), se scritta, altrimenti null\", " +
        "\"versione\": \"numero di versione o revisione della SDS come scritto, altrimenti null\", " +
        "\"data_scadenza\": \"data di scadenza/validità della SDS solo se scritta esplicitamente, come scritta, altrimenti null\", " +
        "\"diisocianati\": \"'sì' se la SDS dichiara la presenza di diisocianati (punto 3 o 14), 'no' se dichiara l'assenza o non contiene diisocianati\" " +
        "} " +
        "REGOLE: " +
        "1) Riporta i dati che trovi nel testo della SDS. " +
        "2) Se un dato manca usa null (l'oggetto JSON null, non la stringa \"null\"); per gli array usa un array vuoto []. " +
        "3) Per i numeri (temperature, percentuali, densità): riporta il valore ESATTO come scritto, con tutti i decimali. Non arrotondare. " +
        "4) Per i CAS: riporta il numero CAS esattamente come scritto nel formato xxx-xx-x; se non lo leggi con certezza metti la voce in composizione_cas_da_verificare. " +
        "5) Non aggiungere testo fuori dal JSON.";

    // Chiamata LLM per una singola sezione della SDS.
    private async Task<(string SectionKey, string? Json)> CallLlmForSectionAsync(string prompt, string sectionText, string? fileName, Stream? pdfStream)
    {
        var sectionKey = prompt switch
        {
            Section1Prompt => "section1",
            Section2Prompt => "section2",
            Section3Prompt => "section3",
            Section9Prompt => "section9",
            _ => "unknown"
        };
        
        try
        {
            var json = await CallLlmWithPromptAsync(prompt, sectionText, fileName, pdfStream);
            return (sectionKey, json);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Errore nella chiamata LLM per la sezione {Section}", sectionKey);
            return (sectionKey, null);
        }
    }

    // Chiamata LLM generica con un prompt specifico e il testo della sezione.
    private async Task<string?> CallLlmWithPromptAsync(string prompt, string sectionText, string? fileName, Stream? pdfStream)
    {
        var baseUrl = (_configuration["LLM:BaseUrl"] ?? "http://localhost:8000").TrimEnd('/');
        var model = _configuration["LLM:Model"] ?? "hexagon";
        var apiKey = _configuration["LLM:ApiKey"];
        var timeout = int.TryParse(_configuration["LLM:TimeoutSeconds"], out var t) ? t : 300;
        var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(timeout);
        if (!string.IsNullOrWhiteSpace(apiKey))
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

        // Vision: le prime N pagine come PNG base64 (config LLM:VisionEnabled / LLM:VisionMaxPages).
        var visionEnabled = bool.TryParse(_configuration["LLM:VisionEnabled"], out var ve) && ve;
        var maxPages = int.TryParse(_configuration["LLM:VisionMaxPages"], out var mp) ? mp : 4;
        List<object>? imageParts = null;
        if (visionEnabled && pdfStream != null)
        {
            try
            {
                // Resetta la posizione dello stream prima del rendering per evitare errori di lettura
                pdfStream.Position = 0;
                imageParts = RenderPdfPagesAsBase64Png(pdfStream, maxPages);
                if (imageParts.Count == 0) imageParts = null;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Render pagine PDF per vision fallito: si prosegue con solo testo");
                imageParts = null;
            }
        }

        var systemContent = "Sei un analista esperto di schede di sicurezza (SDS/GHS) chimiche. Estrai i dati dal testo della SDS fornita seguendo la struttura JSON richiesta. Se un dato non è presente nel testo usa null (l'oggetto JSON null, mai la stringa \"null\"); per gli array usa un array vuoto []. Non calcolare né stimare valori non scritti nella SDS. Rispondi SEMPRE con un solo oggetto JSON valido, senza testo aggiuntivo, senza markdown, senza backticks.";
        var userJson = new System.Text.StringBuilder();
        userJson.Append('[');
        userJson.Append(System.Text.Json.JsonSerializer.Serialize(new { type = "text", text = prompt + "\n\nTESTO DELLA SEZIONE:\n" + sectionText }));
        if (imageParts != null)
        {
            userJson.Append(',');
            userJson.Append(System.Text.Json.JsonSerializer.Serialize(new { type = "text", text = $"\n\nIMMAGINI DELLE PRIME {maxPages} PAGINE DELLA SDS (per la lettura dei pittogrammi GHS della sezione 2.2):" }));
            foreach (var part in imageParts)
            {
                userJson.Append(',');
                userJson.Append(System.Text.Json.JsonSerializer.Serialize(part));
            }
        }
        userJson.Append(']');

        var payloadJson = $@"{{""model"":{System.Text.Json.JsonSerializer.Serialize(model)},""messages"":[{{""role"":""system"",""content"":{System.Text.Json.JsonSerializer.Serialize(systemContent)}}},{{""role"":""user"",""content"":{userJson}}}],""temperature"":0,""max_tokens"":8000,""response_format"":{{""type"":""json_object""}}}}";

        try
        {
            _logger.LogInformation("LLM call (sezione): url={Url} model={Model} textLen={Len} images={Images}", $"{baseUrl}/v1/chat/completions", model, sectionText.Length, imageParts?.Count ?? 0);
            using var response = await client.PostAsync($"{baseUrl}/v1/chat/completions", new StringContent(payloadJson, System.Text.Encoding.UTF8, "application/json"));
            if (!response.IsSuccessStatusCode)
            {
                var errBody = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("LLM HTTP {Status}: {Body}", (int)response.StatusCode, errBody);
                return null;
            }

            var body = await response.Content.ReadAsStringAsync();
            using var doc = System.Text.Json.JsonDocument.Parse(body);
            var content = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

            var json = ExtractJson(content);
            if (json == null)
            {
                _logger.LogWarning("Nessun JSON trovato nella risposta LLM. Content: {Content}", content);
                return null;
            }

            try
            {
                System.Text.Json.JsonDocument.Parse(json);
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

    // Unisce i risultati delle chiamate LLM per sezione in un unico JSON.
    private static string MergeSectionResults(Dictionary<string, string?> sectionResults)
    {
        var merged = new System.Text.Json.Nodes.JsonObject();
        
        foreach (var (sectionKey, json) in sectionResults)
        {
            if (json == null) continue;
            
            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(json);
                foreach (var prop in doc.RootElement.EnumerateObject())
                {
                    // Evita sovrascritture: se la proprietà esiste già, salta
                    if (!merged.ContainsKey(prop.Name))
                        merged[prop.Name] = System.Text.Json.Nodes.JsonNode.Parse(prop.Value.GetRawText());
                }
            }
            catch (Exception ex)
            {
                // Logga l'errore ma continua con le altre sezioni
                System.Diagnostics.Debug.WriteLine($"Errore nel parsing della sezione {sectionKey}: {ex.Message}");
            }
        }
        
        return merged.ToJsonString();
    }

    // Chiamata LLM: invia il prompt completo con il testo della SDS e, se abilitata (LLM:VisionEnabled),
    // le prime pagine del PDF come immagini per la lettura dei pittogrammi GHS (sezione 2.2).
    private async Task<string?> CallLlmAsync(string pdfText, string? fileName, Stream? pdfStream = null)
    {
        var baseUrl = (_configuration["LLM:BaseUrl"] ?? "http://localhost:8000").TrimEnd('/');
        var model = _configuration["LLM:Model"] ?? "hexagon";
        var apiKey = _configuration["LLM:ApiKey"];
        var timeout = int.TryParse(_configuration["LLM:TimeoutSeconds"], out var t) ? t : 300;
        var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(timeout);
        if (!string.IsNullOrWhiteSpace(apiKey))
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

        // Vision: le prime N pagine come PNG base64 (config LLM:VisionEnabled / LLM:VisionMaxPages).
        var visionEnabled = bool.TryParse(_configuration["LLM:VisionEnabled"], out var ve) && ve;
        var maxPages = int.TryParse(_configuration["LLM:VisionMaxPages"], out var mp) ? mp : 4;
        List<object>? imageParts = null;
        if (visionEnabled && pdfStream != null)
        {
            try
            {
                // Resetta la posizione dello stream prima del rendering per evitare errori di lettura
                pdfStream.Position = 0;
                imageParts = RenderPdfPagesAsBase64Png(pdfStream, maxPages);
                if (imageParts.Count == 0) imageParts = null;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Render pagine PDF per vision fallito: si prosegue con solo testo");
                imageParts = null;
            }
        }

        // Il payload viene costruito come JSON esplicito: il contenuto del messaggio user è un array
        // eterogeneo (parti di testo + parti image_url) che non si rappresenta bene con oggetti anonimi.
        var systemContent = "Sei un analista esperto di schede di sicurezza (SDS/GHS) chimiche. Estrai i dati dal testo della SDS fornita seguendo la struttura JSON richiesta. Se un dato non è presente nel testo usa null (l'oggetto JSON null, mai la stringa \"null\"); per gli array usa un array vuoto []. Non calcolare né stimare valori non scritti nella SDS. Rispondi SEMPRE con un solo oggetto JSON valido, senza testo aggiuntivo, senza markdown, senza backticks.";
        var userJson = new System.Text.StringBuilder();
        userJson.Append('[');
        userJson.Append(System.Text.Json.JsonSerializer.Serialize(new { type = "text", text = FullFieldsPrompt + "\n\nTESTO DELLA SDS:\n" + pdfText }));
        if (imageParts != null)
        {
            userJson.Append(',');
            userJson.Append(System.Text.Json.JsonSerializer.Serialize(new { type = "text", text = $"\n\nIMMAGINI DELLE PRIME {maxPages} PAGINE DELLA SDS (per la lettura dei pittogrammi GHS della sezione 2.2):" }));
            foreach (var part in imageParts)
            {
                userJson.Append(',');
                userJson.Append(System.Text.Json.JsonSerializer.Serialize(part));
            }
        }
        userJson.Append(']');

        var payloadJson = $@"{{""model"":{System.Text.Json.JsonSerializer.Serialize(model)},""messages"":[{{""role"":""system"",""content"":{System.Text.Json.JsonSerializer.Serialize(systemContent)}}},{{""role"":""user"",""content"":{userJson}}}],""temperature"":0,""max_tokens"":8000,""response_format"":{{""type"":""json_object""}}}}";

        try
        {
            _logger.LogInformation("LLM call: url={Url} model={Model} textLen={Len} images={Images}", $"{baseUrl}/v1/chat/completions", model, pdfText.Length, imageParts?.Count ?? 0);
            using var response = await client.PostAsync($"{baseUrl}/v1/chat/completions", new StringContent(payloadJson, System.Text.Encoding.UTF8, "application/json"));
            if (!response.IsSuccessStatusCode)
            {
                var errBody = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("LLM HTTP {Status}: {Body}", (int)response.StatusCode, errBody);
                return null;
            }

            var body = await response.Content.ReadAsStringAsync();
            using var doc = System.Text.Json.JsonDocument.Parse(body);
            var content = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

            var json = ExtractJson(content);
            if (json == null)
            {
                _logger.LogWarning("Nessun JSON trovato nella risposta LLM. Content: {Content}", content);
                return null;
            }

            try
            {
                System.Text.Json.JsonDocument.Parse(json);
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

    // Renderizza le prime maxPages pagine del PDF come PNG base64 (per la chiamata LLM con vision).
    // Usa PDFtoImage (SkiaSharp) per un rendering reale della pagina: testo, forme vettoriali e
    // immagini incorporate (inclusi i pittogrammi GHS della sezione 2.2) vengono riprodotti fedelmente.
    private static List<object> RenderPdfPagesAsBase64Png(Stream pdfStream, int maxPages)
    {
        var parts = new List<object>();
        using var ms = new MemoryStream();
        pdfStream.CopyTo(ms);

        // PDFtoImage apre il flusso in sola lettura: ogni pagina viene renderizzata dal flusso stesso.
        foreach (var page in PDFtoImage.Conversion.ToImages(ms, 1..maxPages))
        {
            using var pngMs = new MemoryStream();
            page.Encode(SkiaSharp.SKEncodedImageFormat.Png, 100).SaveTo(pngMs);
            var base64 = Convert.ToBase64String(pngMs.ToArray());
            parts.Add(new { type = "image_url", image_url = new { url = $"data:image/png;base64,{base64}" } });
        }

        return parts;
    }

    // Valori che il modello usa per "dato assente": normalizzati a null.
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

    // Date: "4 Giugno 2025", "15 Dicembre 2023", "4 June 2025", "04/06/2025", "2025-06-04"
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

    // Campo array (es. pittogrammi, composizione): restituisce gli elementi stringa puliti.
    // Se il modello restituisce una stringa al posto dell'array, la spezza sulle virgole.
    private static List<string> GetJsonArray(System.Text.Json.JsonElement root, params string[] names)
    {
        var result = new List<string>();
        foreach (var name in names)
        {
            if (!root.TryGetProperty(name, out var el)) continue;
            if (el.ValueKind == System.Text.Json.JsonValueKind.Null) return result;

            IEnumerable<System.Text.Json.JsonElement> items = el.ValueKind == System.Text.Json.JsonValueKind.Array
                ? el.EnumerateArray()
                : new[] { el };

            foreach (var item in items)
            {
                var raw = item.ValueKind == System.Text.Json.JsonValueKind.String ? item.GetString() : item.GetRawText();
                if (string.IsNullOrWhiteSpace(raw)) continue;
                // Tolleranza: stringa unica con più voci separate da virgola
                foreach (var part in raw.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries))
                    result.Add(part);
            }
        }
        return result;
    }

    // Cerca prima l'intestazione esatta (a meno di spazi/a capo), poi una che la contiene:
    // così "Composizione" non viene confusa con "Composizione n. CAS > 0,1%"
    private static int FindColumn(Dictionary<string, int> colMap, params string[] candidates)
    {
        static string Normalize(string s) => System.Text.RegularExpressions.Regex.Replace(s, @"\s+", " ").Trim();

        foreach (var candidate in candidates)
            foreach (var (header, col) in colMap)
                if (Normalize(header).Equals(Normalize(candidate), StringComparison.OrdinalIgnoreCase))
                    return col;

        foreach (var candidate in candidates)
            foreach (var (header, col) in colMap)
                if (Normalize(header).Contains(Normalize(candidate), StringComparison.OrdinalIgnoreCase))
                    return col;

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
        if (combined.Contains("diiso") || combined.Contains("di-iso") || combined.Contains("diisocyan"))
            return true;
        return null;
    }
}
