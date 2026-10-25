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

    public SdsVerifier(string sourceText, bool isOcr = false)
    {
        _isOcr = isOcr;
        _spaced = Regex.Replace(Normalize(sourceText), @"\s+", " ");
        _flat = Regex.Replace(_spaced, @"\s+", "");
    }

    private static string Normalize(string s) => s.Normalize(NormalizationForm.FormKC).ToLowerInvariant()
        .Replace('º', '°').Replace('–', '-').Replace('—', '-').Replace('‐', '-').Replace('−', '-').Replace('’', '\'');

    private static string Flat(string s) => Regex.Replace(Normalize(s), @"\s+", "");

    private void Flag(string campo, string motivo)
    {
        // Testo letto con OCR: i caratteri riconosciuti possono avere errori,
        // quindi un dato "non trovato" non viene scartato, solo segnalato da controllare
        if (_isOcr)
            motivo += " [testo letto con OCR: i caratteri possono contenere errori, verificare sulla scheda PDF]";
        Issues.Add((campo, motivo));
    }

    public bool ContainsText(string value) => _flat.Contains(Flat(value));

    // Tutte le parole significative (almeno 3 lettere/cifre) devono comparire nel testo
    public bool ContainsWords(string value)
    {
        var words = Regex.Matches(value, @"[\p{L}\p{N}]{3,}").Select(m => Flat(m.Value)).ToList();
        return words.Count > 0 ? words.All(w => _flat.Contains(w)) : ContainsText(value);
    }

    // Il numero deve comparire isolato (non dentro un altro numero), con virgola o punto decimale
    public bool ContainsNumber(string number)
    {
        foreach (var variant in new[] { number, number.Replace(',', '.'), number.Replace('.', ',') }.Distinct())
        {
            // Non attaccato ad altre cifre ("3,35"), ma "n.35" va bene
            if (Regex.IsMatch(_spaced, $@"(?<!\d)(?<!\d[.,]){Regex.Escape(variant)}(?![\d])")) return true;
        }
        return false;
    }

    private static List<string> Numbers(string value) =>
        Regex.Matches(value, @"\d+(?:[.,]\d+)?").Select(m => m.Value).ToList();

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

    // Il numero deve comparire (isolato) entro poche righe dopo una delle etichette del campo
    public bool ContainsNumberNear(string number, string[] anchors, int window = 200)
    {
        var variants = new[] { number, number.Replace(',', '.'), number.Replace('.', ',') }.Distinct().ToList();
        foreach (var anchor in anchors)
        {
            for (var idx = _spaced.IndexOf(anchor, StringComparison.Ordinal); idx >= 0;
                 idx = _spaced.IndexOf(anchor, idx + 1, StringComparison.Ordinal))
            {
                var slice = _spaced.Substring(idx, Math.Min(window, _spaced.Length - idx));
                if (variants.Any(v => Regex.IsMatch(slice, $@"(?<!\d)(?<!\d[.,]){Regex.Escape(v)}(?![\d])"))) return true;
            }
        }
        return false;
    }

    // Percentuale di un componente: cercata nel tratto di testo subito dopo il nome. Nel testo del PDF
    // la percentuale può essere attaccata ad altri numeri (es. indice "601-021-00-3" + "18" = "...00-318")
    public bool ContainsNumberAfterName(string number, string name, int window = 160)
    {
        var flatName = Flat(name);
        if (flatName.Length == 0) return false;
        var variants = new[] { number, number.Replace(',', '.'), number.Replace('.', ',') }.Distinct().ToList();
        for (var idx = _flat.IndexOf(flatName, StringComparison.Ordinal); idx >= 0;
             idx = _flat.IndexOf(flatName, idx + 1, StringComparison.Ordinal))
        {
            var slice = _flat.Substring(idx + flatName.Length, Math.Min(window, _flat.Length - idx - flatName.Length));
            if (variants.Any(v => slice.Contains(v))) return true;
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

    private bool ContainsCas(string cas) => Regex.IsMatch(_flat, $@"(?<![\d-]){Regex.Escape(cas)}(?![\d-])");

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
        Regex.Split(value, @";|,\s*(?=[^\d\s])").Select(e => e.Trim()).Where(e => e.Length > 0).ToList();

    private static string EntryName(string entry)
    {
        var name = entry.Split('|')[0];
        name = Regex.Replace(name, @"\(.*?\)|\[.*?\]", " ");
        name = Regex.Split(name, @"\d")[0];
        // via anche i simboli di confronto che precedono la percentuale ("Sodio idrossido >98%")
        return name.Trim(' ', ',', ';', ':', '-', '<', '>', '≤', '≥', '=', '~');
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

        if (card.CovPercent != null && Regex.IsMatch(card.CovPercent, @"stimat|calcolat|circa|approx", RegexOptions.IgnoreCase))
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
            var code = Regex.Replace(raw, @"\s+", "");
            if (!Regex.IsMatch(code, @"^(H\d{3}[A-Za-z]*|EUH\d{3}[A-Za-z]?)$", RegexOptions.IgnoreCase))
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
            var m = Regex.Match(raw, @"GHS\s*0?([1-9])\b", RegexOptions.IgnoreCase);
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

            var cas = Regex.Matches(entry, @"(?<![\d-])\d{2,7}-\d{2}-\d(?![\d-])").Select(m => m.Value).ToList();
            var badCas = cas.Where(c => !IsValidCas(c) || !ContainsCas(c)).ToList();
            if (badCas.Count > 0)
            {
                Flag(campo, $"CAS {string.Join(", ", badCas)} di \"{name}\" non trovato nella SDS o non valido");
                continue;
            }

            // Percentuali: i numeri che non sono CAS devono essere scritti nella SDS
            var withoutCas = cas.Aggregate(entry, (e, c) => e.Replace(c, " "));
            var percentPart = Regex.Match(withoutCas, @"[<>≤≥=~]*\s*\d[\d\s.,<>≤≥=x%-]*%?$");
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
