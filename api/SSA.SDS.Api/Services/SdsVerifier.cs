using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using SSA.SDS.Api.Entities;

namespace SSA.SDS.Api.Services;

// Controlla che ogni dato estratto dall'LLM sia scritto nel testo della SDS.
// Un dato che non si ritrova non viene salvato (l'LLM potrebbe averlo inventato o dedotto):
// il campo viene segnato "da verificare" con il motivo, così lo si controlla sulla scheda PDF.
public class SdsVerifier
{
    // Testo senza spazi: per nomi e codici, che nel PDF possono essere spezzati o incollati
    private readonly string _flat;
    // Testo con spazi singoli: per i numeri, che non vanno fusi con le cifre vicine
    private readonly string _spaced;
    // true se il testo è stato letto con OCR da una scansione: i caratteri riconosciuti
    // possono avere errori, quindi i controlli "non trovato" diventano avvisi da controllare
    private readonly bool _isOcr;

    public List<(string Campo, string Motivo)> Issues { get; } = new();

    // Regex precompilate: prima venivano ricompilate a ogni chiamata (ContainsNumber,
    // ContainsCas, CheckHCodes...) e su composizioni con molti componenti il costo
    // di compilazione superava quello della ricerca stessa.
    private static readonly Regex WhitespaceRegex = new(@"\s+", RegexOptions.Compiled);
    private static readonly Regex WordRegex = new(@"[\p{L}\p{N}]{3,}", RegexOptions.Compiled);
    private static readonly Regex NumberRegex = new(@"\d+(?:[.,]\d+)?", RegexOptions.Compiled);
    private static readonly Regex CasInEntryRegex = new(@"(?<![\d-])\d{2,7}-\d{2}-\d(?![\d-])", RegexOptions.Compiled);
    private static readonly Regex HCodeFormatRegex = new(@"^(H\d{3}[A-Za-z]*|EUH\d{3}[A-Za-z]?)$", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex GhsCodeRegex = new(@"GHS\s*0?([1-9])\b", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex HPhraseCodeRegex = new(@"H\s*(\d{3}[a-d]?)(?:\s*,\s*|\s*;|\s+)", RegexOptions.Compiled);
    private static readonly Regex HPhraseCodeAltRegex = new(@"H\s*(\d{3}[a-d]?)\b", RegexOptions.Compiled);
    private static readonly Regex HCodeSuffixRegex = new(@"[a-d]$", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex SplitEntriesRegex = new(@";|,\s*(?=[^\d\s])", RegexOptions.Compiled);
    private static readonly Regex ParenRegex = new(@"\(.*?\)|\[.*?\]", RegexOptions.Compiled);
    private static readonly Regex DigitsSplitRegex = new(@"\d", RegexOptions.Compiled);
    private static readonly Regex EstimatedRegex = new(@"stimat|calcolat|circa|approx", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex PercentPartRegex = new(@"[<>≤≥=~]*\s*\d[\d\s.,<>≤≥=x%-]*%?$", RegexOptions.Compiled);
    private static readonly Regex DashesRegex = new(@"-", RegexOptions.Compiled);
    private static readonly Regex SpacesRegex = new(@"\s+", RegexOptions.Compiled);

    public SdsVerifier(string sourceText, bool isOcr = false)
    {
        _isOcr = isOcr;
        _spaced = WhitespaceRegex.Replace(Normalize(sourceText), " ");
        _flat = WhitespaceRegex.Replace(_spaced, "");
    }

    private static string Normalize(string s) => s.Normalize(NormalizationForm.FormKC).ToLowerInvariant()
        .Replace('º', '°').Replace('–', '-').Replace('—', '-').Replace('‐', '-').Replace('−', '-').Replace('’', '\'');

    private static string Flat(string s) => WhitespaceRegex.Replace(Normalize(s), "");

    private void Flag(string campo, string motivo)
    {
        // Testo letto con OCR: i caratteri riconosciuti possono avere errori,
        // quindi un dato "non trovato" non viene scartato, solo segnalato da controllare
        if (_isOcr)
            motivo += " [testo letto con OCR: i caratteri possono contenere errori, verificare sulla scheda PDF]";
        Issues.Add((campo, motivo));
    }

    public bool ContainsText(string value) => _flat.Contains(Flat(value));

    // Tutte le parole significative (almeno 3 lettere/cifre) devono comparire nel testo.
    // Per i nomi chimici (es. "acido ottadecanoico, 12-idrossi-, prodotti di reazione con
    // etilendiammina") la verifica è più tollerante: basta che il 60% delle parole
    // significative compaia nel testo, perché i nomi IUPAC possono essere spezzati o
    // riformulati nel PDF (es. "12-idrossi" vs "12 idrossi", "ottadecanoico" vs "C18").
    // Per i nomi lunghi (>= 5 parole) la soglia scende al 50%: i nomi IUPAC complessi
    // hanno molte parole e basta una o due diverse per non trovare il 60%.
    public bool ContainsWords(string value)
    {
        var words = WordRegex.Matches(value).Select(m => Flat(m.Value)).Where(w => !IsStopWord(w)).ToList();
        if (words.Count == 0) return ContainsText(value);

        var found = words.Count(w => _flat.Contains(w));
        // Soglia: almeno il 60% delle parole significative deve comparire nel testo.
        // Per i nomi lunghi (>= 5 parole) la soglia scende al 50%.
        var threshold = words.Count >= 5 ? 0.5 : 0.6;
        return found >= Math.Ceiling(words.Count * threshold);
    }

    // Parole troppo comuni che non aiutano la verifica: filtratele
    private static readonly HashSet<string> StopWords = new(System.StringComparer.OrdinalIgnoreCase)
    {
        "percentuale", "percent", "quantitÃ ", "quant", "contenuto", "composto",
        "compos", "prodotto", "sostanza", "componente", "parte",
        "sezione", "capitolo", "punto", "informazioni", "dati",
        "scheda", "sicurezza", "pericolo", "pericolositÃ ", "attenzione",
        "avvertenza", "precauzione", "mantenere", "conservare",
        "protegersi", "indossare", "lavare", "areare", "sciacquare",
        "reperire", "medico", "antidoto", "trattamento", "pronto", "soccorso",
        "primo", "intervento", "servizio", "preventivo", "monitoraggio",
        "chronic", "acute", "toxic", "harmful", "irritant", "flam",
        "explos", "oxid", "press", "corros", "health", "environment",
        "warning", "danger", "risk", "safety", "dangerous", "volatile"
    };

    private static bool IsStopWord(string word) => StopWords.Contains(word);

    // Il numero deve comparire isolato (non dentro un altro numero), con virgola o punto decimale
    public bool ContainsNumber(string number)
    {
        foreach (var variant in new[] { number, number.Replace(',', '.'), number.Replace('.', ',') }.Distinct())
        {
            // Non attaccato ad altre cifre ("3,35"), ma "n.35" va bene
            if (Regex.IsMatch(_spaced, $@"(?<!\d)(?<!\d[.,]){Regex.Escape(variant)}([\s.,;:%]|$)")) return true;
            // Cerca anche nel testo senza spazi (utile per numeri in PDF dove i campi sono attaccati)
            if (_flat.Contains(Flat(variant))) return true;
        }
        return false;
    }

    private static List<string> Numbers(string value) =>
        NumberRegex.Matches(value).Select(m => m.Value).ToList();

    public bool ContainsAllNumbers(string value)
    {
        var nums = Numbers(value);
        return nums.Count > 0 && nums.All(ContainsNumber);
    }

    // Etichette vicino alle quali deve trovarsi il numero: un "81" scritto altrove nella SDS
    // (in un CAS, in un dato ecotossicologico...) non conferma la temperatura di ebollizione
    private static readonly Dictionary<string, string[]> NumberAnchors = new()
    {
        ["temperaturaEbollizione"] = new[] { "ebollizione", "boiling", "teb", "t. eb", "t eb" },
        ["densita"] = new[] { "densit", "density", "peso specifico", "massa volumica", "specific gravity" },
        ["covPercent"] = new[] { "c.o.v", "cov", "voc", "v.o.c", "composti organici volatili", "volatile organic" },
        ["numeroProtocollo"] = new[] { "versione", "revisione", "version", "revision", "rev.", "rev ", "edizione", "n. rev" }
    };

    // Il numero deve comparire (isolato) entro poche righe dopo una delle etichette del campo.
    // La ricerca avviene su _flat (senza spazi): nel testo PDF i campi sono spesso attaccati
    // ("Teb:120°C", "Densità:0,84g/cm3") e la ricerca su _spaced con lookahead di spazio
    // non li trova.
    public bool ContainsNumberNear(string number, string[] anchors, int window = 200)
    {
        var variants = new[] { number, number.Replace(',', '.'), number.Replace('.', ',') }.Distinct().ToList();
        foreach (var anchor in anchors)
        {
            var flatAnchor = Flat(anchor);
            for (var idx = _flat.IndexOf(flatAnchor, StringComparison.Ordinal); idx >= 0;
                 idx = _flat.IndexOf(flatAnchor, idx + 1, StringComparison.Ordinal))
            {
                var slice = _flat.Substring(idx + flatAnchor.Length, Math.Min(window, _flat.Length - idx - flatAnchor.Length));
                if (variants.Any(v => slice.Contains(Flat(v)))) return true;
            }
        }
        return false;
    }

    // Percentuale di un componente: cercata nel tratto di testo subito dopo il nome. Nel testo del PDF
    // la percentuale può essere attaccata ad altri numeri (es. indice "601-021-00-3" + "18" = "...00-318").
    // La ricerca avviene su _flat (senza spazi): nel testo PDF i campi sono spesso attaccati
    // ("xilene18-20%") e la ricerca su _spaced non li trova.
    // Gestisce anche gli intervalli: se la SDS riporta "≥1.0 - ≤5.0" e l'LLM estrae "3.0",
    // il numero 3.0 non è presente ma l'intervallo lo contiene. In questo caso si considera
    // il numero verificato se c'è un intervallo vicino al nome.
    public bool ContainsNumberAfterName(string number, string name, int window = 160)
    {
        var flatName = Flat(name);
        if (flatName.Length == 0) return false;
        var variants = new[] { number, number.Replace(',', '.'), number.Replace('.', ',') }.Distinct().ToList();
        for (var idx = _flat.IndexOf(flatName, StringComparison.Ordinal); idx >= 0;
             idx = _flat.IndexOf(flatName, idx + 1, StringComparison.Ordinal))
        {
            var slice = _flat.Substring(idx + flatName.Length, Math.Min(window, _flat.Length - idx - flatName.Length));
            // Cerca il numero esatto
            if (variants.Any(v => slice.Contains(Flat(v)))) return true;

            // Cerca un intervallo (≥, ≤, <, >) che potrebbe contenere il numero
            // Es: "≥1.0 - ≤5.0" contiene "3.0"
            if (System.Text.RegularExpressions.Regex.IsMatch(slice, @"[≥≤<>]\s*\d"))
            {
                // Estrai i numeri dall'intervallo
                var intervalNumbers = NumberRegex.Matches(slice).Select(m => m.Value).ToList();
                if (intervalNumbers.Count >= 2)
                {
                    var min = double.TryParse(intervalNumbers[0].Replace(',', '.'), out var mn) ? mn : 0;
                    var max = double.TryParse(intervalNumbers[1].Replace(',', '.'), out var mx) ? mx : double.MaxValue;
                    var num = double.TryParse(number.Replace(',', '.'), out var n) ? n : -1;
                    if (num >= min && num <= max) return true;
                }
            }
        }
        return false;
    }

    public static bool IsValidCas(string cas)
    {
        var m = Regex.Match(cas, @"^(\d{2,7})-(\d{2})-(\d)$");
        if (!m.Success) return false;
        var digits = (m.Groups[1].Value + m.Groups[2].Value).Reverse().Select(c => c - '0').ToList();
        var sum = digits.Select((d, i) => d * (i + 1)).Sum();
        return sum % 10 == m.Groups[3].Value[0] - '0';
    }

    // CAS nel testo: cerca il CAS esatto, ma anche con spazi o trattini extra che i PDF
    // inseriscono (es. "1330-20-7" vs "1330 20 7" vs "1330-20-7 "). Il testo _flat ha già
    // gli spazi rimossi, quindi basta cercare la sequenza di cifre e trattini.
    // La ricerca avviene su _flat (senza spazi): nel testo PDF i CAS sono spesso attaccati
    // ad altri caratteri ("CAS:1330-20-7" o "1330-20-718-20%") e le lookahead/lookbehind
    // su _spaced non li trovano.
    private bool ContainsCas(string cas)
    {
        // Cerca il CAS esatto nel testo senza spazi
        if (Regex.IsMatch(_flat, $@"(?<![\d-]){Regex.Escape(cas)}(?![\d-])")) return true;

        // Cerca il CAS con spazi (nel testo _spaced, dove gli spazi sono singoli)
        var casWithSpaces = cas.Replace("-", " ");
        if (Regex.IsMatch(_spaced, $@"(?<![\d-]){Regex.Escape(casWithSpaces)}(?![\d-])")) return true;

        // Cerca la sequenza di cifre senza i trattini (es. "1330207" per "1330-20-7")
        var digitsOnly = DashesRegex.Replace(cas, "");
        if (Regex.IsMatch(_flat, $@"(?<!\d){Regex.Escape(digitsOnly)}(?!\d)")) return true;

        // Ultimo tentativo: cerca la sequenza di cifre anche se attaccata ad altre cifre
        // (es. "133020718" per "1330-20-7" + "18%"). Questo può dare falsi positivi
        // ma è meglio di segnare un CAS valido come "da verificare".
        if (_flat.Contains(digitsOnly)) return true;

        return false;
    }

    // Date: numeriche in vari formati o con il mese in lettere (italiano/inglese)
    public bool ContainsDate(DateTime date)
    {
        var candidates = new List<string>();
        foreach (var d in new[] { date.Day.ToString("00"), date.Day.ToString() })
            foreach (var mo in new[] { date.Month.ToString("00"), date.Month.ToString() })
                foreach (var sep in new[] { "/", ".", "-" })
                {
                    candidates.Add($"{d}{sep}{mo}{sep}{date.Year}");
                    candidates.Add($"{d}{sep}{mo}{sep}{date.Year % 100:00}");
                }
        candidates.Add(date.ToString("yyyy-MM-dd"));
        candidates.Add(date.ToString("yyyy/MM/dd"));
        foreach (var culture in new[] { "it-IT", "en-GB", "en-US" })
        {
            var ci = CultureInfo.GetCultureInfo(culture);
            candidates.Add(date.ToString("d MMMM yyyy", ci));
            candidates.Add(date.ToString("MMMM d, yyyy", ci));
            candidates.Add(date.ToString("d MMM yyyy", ci));
        }
        return candidates.Any(c => _flat.Contains(Flat(c)));
    }

    // Divide un elenco di componenti su ";" o su "," seguita da una lettera (non sulle virgole decimali)
    private static List<string> SplitEntries(string value) =>
        SplitEntriesRegex.Split(value).Select(e => e.Trim()).Where(e => e.Length > 0).ToList();

    private static string EntryName(string entry)
    {
        var name = entry.Split('|')[0];
        // Non rimuovere le parentesi: i nomi chimici spesso le contengono
        // (es. "1,3-bis[12-idrossi-ottadecammide-N-metilene]-benzene")
        // Rimuovi solo i numeri all'inizio (es. "1,3-" in "1,3-bis[...]")
        var match = System.Text.RegularExpressions.Regex.Match(name, @"^[\d,.\-]+");
        if (match.Success && match.Index == 0)
            name = name[match.Length..];
        // via anche i simboli di confronto che precedono la percentuale ("Sodio idrossido >98%")
        return name.Trim(' ', ',', ';', ':', '<', '>', '≤', '≥', '=', '~');
    }

    public void Verify(SafetyCard card, string? fileName)
    {
        // Nome prodotto: obbligatorio. Se non si ritrova si usa il nome del file come segnaposto
        if (string.IsNullOrWhiteSpace(card.Titolo) || !ContainsWords(card.Titolo))
        {
            Flag("titolo", string.IsNullOrWhiteSpace(card.Titolo)
                ? "nome del prodotto non trovato: inserito il nome del file come segnaposto"
                : $"\"{card.Titolo}\" non trovato nel testo della SDS: inserito il nome del file come segnaposto");
            card.Titolo = Path.GetFileNameWithoutExtension(fileName) ?? "Scheda di sicurezza";
        }

        card.EnteEmittitore = CheckWords("enteEmittitore", card.EnteEmittitore);
        card.StatoFisico = CheckWords("statoFisico", card.StatoFisico);
        // Versione: il numero deve stare vicino a "revisione"/"versione" (un "7.3" altrove, es. "sezione 7.3", non vale)
        card.NumeroProtocollo = card.NumeroProtocollo != null && Numbers(card.NumeroProtocollo).Count > 0
            ? CheckNumbers("numeroProtocollo", card.NumeroProtocollo)
            : CheckExact("numeroProtocollo", card.NumeroProtocollo);
        card.SdsUrl = CheckExact("sdsUrl", card.SdsUrl);
        card.DataRilascio = CheckDate("dataRilascio", card.DataRilascio);
        card.DataScadenza = CheckDate("dataScadenza", card.DataScadenza);
        card.TemperaturaEbollizione = CheckNumbers("temperaturaEbollizione", card.TemperaturaEbollizione);
        card.Densita = CheckNumbers("densita", card.Densita);

        if (card.CovPercent != null && EstimatedRegex.IsMatch(card.CovPercent))
        {
            Flag("covPercent", $"\"{card.CovPercent}\" è un valore stimato, non riportato nella SDS");
            card.CovPercent = null;
        }
        card.CovPercent = CheckNumbers("covPercent", card.CovPercent);

        card.FrasiH = CheckHCodes(card.FrasiH);
        card.Pittogrammi = CheckGhs(card.Pittogrammi);
        // Pittogrammi assenti ma frasi H presenti: quasi sempre i pittogrammi sono solo immagini nel PDF
        if (string.IsNullOrWhiteSpace(card.Pittogrammi) && !string.IsNullOrWhiteSpace(card.FrasiH) && !Issues.Any(i => i.Campo == "pittogrammi"))
            Flag("pittogrammi", "codici GHS non scritti nel testo della SDS (probabilmente presenti solo come simboli grafici)");

        card.ComposizioneCasSopra = CheckComposition("composizioneCasSopra", card.ComposizioneCasSopra);
        card.ComposizioneCasSotto = CheckComposition("composizioneCasSotto", card.ComposizioneCasSotto);
        card.Composizione = CheckComposition("composizione", card.Composizione);
    }

    private string? CheckWords(string campo, string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || ContainsWords(value)) return value;
        Flag(campo, $"\"{value}\" non trovato nel testo della SDS");
        return null;
    }

    private string? CheckExact(string campo, string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || ContainsText(value)) return value;
        Flag(campo, $"\"{value}\" non trovato nel testo della SDS");
        return null;
    }

    private string? CheckNumbers(string campo, string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return value;
        var nums = Numbers(value);
        var anchors = NumberAnchors[campo];
        var missing = nums.Where(n => !ContainsNumberNear(n, anchors)).ToList();
        if (nums.Count > 0 && missing.Count == 0) return value;
        Flag(campo, missing.Count > 0
            ? $"\"{value}\": il valore {string.Join(", ", missing)} non è scritto nella SDS vicino a \"{anchors[0]}\""
            : $"\"{value}\" non trovato nel testo della SDS");
        return null;
    }

    private DateTime? CheckDate(string campo, DateTime? value)
    {
        if (value == null || ContainsDate(value.Value)) return value;
        Flag(campo, $"la data {value:dd/MM/yyyy} non compare nella SDS");
        return null;
    }

    // Frasi H: il codice deve essere nel testo, oppure la sua descrizione (foglio "Frasi H")
    private string? CheckHCodes(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return value;
        var kept = new List<string>();
        foreach (var raw in value.Split(',', ';').Select(c => c.Trim()).Where(c => c.Length > 0))
        {
            var code = SpacesRegex.Replace(raw, "");
            if (!HCodeFormatRegex.IsMatch(code))
            {
                Flag("frasiH", $"\"{raw}\" non è un codice di frase H (es. frase R di una SDS precedente al CLP)");
                continue;
            }
            var inText = Regex.IsMatch(_flat, $@"(?<![a-z0-9]){Regex.Escape(code.ToLowerInvariant())}(?![0-9])");
            var byDescription = FrasiH.All.TryGetValue(code, out var d) &&
                ((d.It != null && ContainsText(d.It.TrimEnd('.'))) || (d.En != null && ContainsText(d.En.TrimEnd('.'))));
            if (inText || byDescription) kept.Add(code);
            else if (_isOcr) kept.Add(code); // testo OCR: non si può escludere, va controllato a mano
            else Flag("frasiH", $"{code} non trovata nella SDS (né il codice né la descrizione)");
        }
        return kept.Count > 0 ? string.Join(", ", kept) : null;
    }

    // Pittogrammi: solo codici GHS01-GHS09 scritti nel testo. Se nella SDS c'è solo il simbolo
    // grafico il codice non è leggibile dal testo e non va dedotto
    private string? CheckGhs(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return value;
        var kept = new List<string>();
        foreach (var raw in value.Split(',', ';').Select(c => c.Trim()).Where(c => c.Length > 0))
        {
            var m = GhsCodeRegex.Match(raw);
            if (!m.Success)
            {
                Flag("pittogrammi", $"\"{raw}\" non è un codice GHS valido (GHS01-GHS09)");
                continue;
            }
            var code = "GHS0" + m.Groups[1].Value;
            if (Regex.IsMatch(_flat, $@"ghs0?{m.Groups[1].Value}(?![0-9])")) kept.Add(code);
            else if (_isOcr) kept.Add(code); // testo OCR: non si può escludere, va controllato a mano
            else Flag("pittogrammi", $"{code} non è scritto nel testo della SDS (forse presente solo come simbolo grafico)");
        }
        return kept.Count > 0 ? string.Join(", ", kept.Distinct()) : null;
    }

    // Composizioni: per ogni componente il nome deve essere nel testo, il CAS valido e presente,
    // le percentuali scritte nella SDS (non calcolate). Le parti non verificate vengono tolte
    private string? CheckComposition(string campo, string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return value;
        var kept = new List<string>();
        foreach (var entry in SplitEntries(value))
        {
            var name = EntryName(entry);
            if (name.Length > 0 && !ContainsWords(name))
            {
                Flag(campo, $"componente \"{name}\" non trovato nel testo della SDS");
                continue;
            }

            var cas = CasInEntryRegex.Matches(entry).Select(m => m.Value).ToList();
            // CAS: se il checksum è errato il CAS è sicuramente sbagliato -> scarta.
            // Se il checksum è corretto ma il CAS non si trova nel testo, potrebbe essere
            // un errore di OCR o di formattazione del PDF: non scartare l'intero componente,
            // segnala solo il CAS come da verificare e mantieni nome e percentuale.
            var invalidCas = cas.Where(c => !IsValidCas(c)).ToList();
            if (invalidCas.Count > 0)
            {
                Flag(campo, $"CAS {string.Join(", ", invalidCas)} di \"{name}\" non valido (checksum errato)");
                continue;
            }
            var missingCas = cas.Where(c => !ContainsCas(c)).ToList();
            if (missingCas.Count > 0)
            {
                Flag(campo, $"CAS {string.Join(", ", missingCas)} di \"{name}\" non trovato nel testo della SDS (possibile errore di formattazione)");
                // Non scartare il componente: rimuovi solo il CAS non trovato e mantieni nome + percentuale
                var cleanedEntry = cas.Aggregate(entry, (e, c) => missingCas.Contains(c) ? e.Replace(c, " ") : e);
                kept.Add(cleanedEntry.Trim().Trim('|', ' '));
                continue;
            }

            // Percentuali: i numeri che non sono CAS devono essere scritti nella SDS
            var withoutCas = cas.Aggregate(entry, (e, c) => e.Replace(c, " "));
            var percentPart = PercentPartRegex.Match(withoutCas);
            var numbers = Numbers(withoutCas.Substring(name.Length > 0 && withoutCas.Contains(name) ? withoutCas.IndexOf(name) + name.Length : 0));
            var missing = numbers.Where(n => !ContainsNumberAfterName(n, name)).ToList();
            if (missing.Count > 0)
            {
                Flag(campo, $"percentuale {string.Join(", ", missing)}% di \"{name}\" non scritta nella SDS: tolta");
                var cleaned = entry.Contains('|')
                    ? string.Join("|", entry.Split('|').Where(p => !Numbers(p).Any(n => missing.Contains(n))))
                    : (percentPart.Success ? entry[..percentPart.Index].TrimEnd() : name);
                kept.Add(cleaned.Trim().TrimEnd('|'));
                continue;
            }
            kept.Add(entry);
        }
        return kept.Count > 0 ? string.Join(", ", kept) : null;
    }
}
