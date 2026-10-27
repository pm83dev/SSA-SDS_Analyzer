using System.Globalization;
using System.Text.RegularExpressions;

// Test offline della logica deterministica (passi C/D/E) copiata da ImportService:
// NormalizeMissing, SplitComposizioneByThreshold, ParseSdsDate, DensityWithoutUnit,
// SplitIntoSections.

static string? NormalizeMissing(string? value)
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

var CompositionEntryRegex = new Regex(@"(?<name>[^|]+)\|(?<cas>[^|]*?)\|(?<pct>[^|]*?)(?=,\s|\s;|$|;)", RegexOptions.Compiled);
var PercentRangeRegex = new Regex(@"(?:[<>≤≥]=?\s*)?(?<lo>\d{1,3}(?:[.,]\d+)?)\s*(?:-\s*(?:[<>≤≥]=?\s*)?(?<hi>\d{1,3}(?:[.,]\d+)?))?\s*%?", RegexOptions.Compiled);

static double? ParsePercentUpper(string? percent, Regex rx)
{
    if (string.IsNullOrWhiteSpace(percent)) return null;
    if (NormalizeMissing(percent) == null) return null;
    var m = rx.Match(percent);
    if (!m.Success) return null;
    var bound = m.Groups["hi"].Success ? m.Groups["hi"] : m.Groups["lo"];
    return double.TryParse(bound.Value.Replace(',', '.'), NumberStyles.Float, CultureInfo.InvariantCulture, out var d) ? d : null;
}

static bool CasOk(string cas)
{
    var m = Regex.Match(cas, @"^(\d{2,7})-(\d{2})-(\d)$");
    if (!m.Success) return false;
    var digits = (m.Groups[1].Value + m.Groups[2].Value).Reverse().Select(c => c - '0').ToList();
    var sum = digits.Select((d, i) => d * (i + 1)).Sum();
    return sum % 10 == m.Groups[3].Value[0] - '0';
}

Console.WriteLine("== ParsePercentUpper ==");
foreach (var p in new[] { "≥10 - ≤25 %", "≥10 - ≤25", "<1,0", "<1.0%", "≤0,30 %", "≤0.30%", "0,05 %", "5.0 - 10", "1.4", "25 - 50", "Non disponibile" })
    Console.WriteLine($"  '{p}' -> {ParsePercentUpper(p, PercentRangeRegex)?.ToString(CultureInfo.InvariantCulture) ?? "null"}");

Console.WriteLine("== CAS checksum ==");
foreach (var c in new[] { "1330-20-7", "25068-38-6", "100-41-4", "78-83-1", "911674-82-3", "100545-48-0", "200-578-6", "90989-38-1" })
    Console.WriteLine($"  {c} -> {(CasOk(c) ? "ok" : "BAD")}");

Console.WriteLine("== SplitComposizioneByThreshold ==");
void Split(string comp)
{
    var sopra = new List<string>(); var sotto = new List<string>(); var dv = new List<string>();
    foreach (Match m in CompositionEntryRegex.Matches(comp))
    {
        var name = m.Groups["name"].Value.Trim().TrimStart(',', ';', ' ').Trim();
        var cas = NormalizeMissing(m.Groups["cas"].Value);
        var pct = NormalizeMissing(m.Groups["pct"].Value);
        if (name.Length == 0) continue;
        var casOk = cas != null && Regex.IsMatch(cas, @"^\d{2,7}-\d{2}-\d$") && CasOk(cas);
        if (cas != null && !casOk) { dv.Add($"CAS '{cas}' di '{name}' non valido"); cas = null; }
        var entry = $"{name}|{cas}|{pct}";
        var upper = ParsePercentUpper(pct, PercentRangeRegex);
        if (upper == null) dv.Add($"pct '{name}' ({pct}) non interpretabile");
        else if (upper > 0.1) sopra.Add(entry);
        else sotto.Add(entry);
    }
    Console.WriteLine($"  SOPRA ({sopra.Count}): {string.Join(" , ", sopra)}");
    Console.WriteLine($"  SOTTO ({sotto.Count}): {string.Join(" , ", sotto)}");
    foreach (var d in dv) Console.WriteLine($"  DV: {d}");
}

Split("xilene|1330-20-7|≥10 - ≤25, resine epossidiche (peso molecolare medio ≤ 700)|25068-38-6|≥5.0 - ≤10, etilbenzene|100-41-4|≥1.0 - ≤5.0, 2-metilpropan-1-olo|78-83-1|≥1.0 - <3.0, 1,3-bis[12-idrossi-ottadecammide-N-metilene]-benzene e acido ottadecanoico, 12-idrossi-, prodotti di reazione con etilendiammina|911674-82-3|<1.0, trietilentetrammina|100545-48-0|≤0.30");
Split("2-metilpropan-1-olo|78-83-1|≥25 - ≤50, xilene|1330-20-7|≥10 - ≤25");
Split("acido ottadecanoico|200-578-6|<1.0"); // CAS = numero CE -> checksum?
Split("sostanza||5%"); // CAS vuoto
Split("sostanza|123-45-6|non disponibile"); // pct non interpretabile

Console.WriteLine("== NormalizeMissing ==");
foreach (var v in new[] { "null", "N/A", "-", "Non disponibile.", "non presente", "Liquido.", "" })
    Console.WriteLine($"  '{v}' -> {(NormalizeMissing(v) ?? "NULL")}");

Console.WriteLine("== ParseSdsDate ==");
static DateTime? ParseDate(string? value)
{
    if (string.IsNullOrWhiteSpace(value)) return null;
    var formats = new[] { "yyyy-MM-dd", "dd/MM/yyyy", "d/M/yyyy", "dd-MM-yyyy", "dd.MM.yyyy" };
    if (DateTime.TryParseExact(value.Trim(), formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out var exact))
        return exact;
    return DateTime.TryParse(value, CultureInfo.GetCultureInfo("it-IT"), DateTimeStyles.None, out var parsed) ? parsed : null;
}
var MonthNameDateRegex = new Regex(@"(?<d>\d{1,2})\s+(?<m>gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(?<y>\d{4})", RegexOptions.IgnoreCase | RegexOptions.Compiled);
var MonthNumbers = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
{
    ["gennaio"]=1,["febbraio"]=2,["marzo"]=3,["aprile"]=4,["maggio"]=5,["giugno"]=6,["luglio"]=7,["agosto"]=8,["settembre"]=9,["ottobre"]=10,["novembre"]=11,["dicembre"]=12,
    ["jan"]=1,["january"]=1,["feb"]=2,["february"]=2,["mar"]=3,["march"]=3,["apr"]=4,["april"]=4,["may"]=5,["jun"]=6,["june"]=6,["jul"]=7,["july"]=7,["aug"]=8,["august"]=8,["sep"]=9,["september"]=9,["oct"]=10,["october"]=10,["nov"]=11,["november"]=11,["dec"]=12,["december"]=12
};
static DateTime? ParseSdsDate(string? value, Regex rx, Dictionary<string, int> months)
{
    if (string.IsNullOrWhiteSpace(value)) return null;
    var v = value.Trim();
    var formats = new[] { "yyyy-MM-dd", "dd/MM/yyyy", "d/M/yyyy", "dd-MM-yyyy", "dd.MM.yyyy", "yyyy/MM/dd" };
    if (DateTime.TryParseExact(v, formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out var exact))
        return exact;
    var m = rx.Match(v);
    if (m.Success && months.TryGetValue(m.Groups["m"].Value, out var month) &&
        DateTime.TryParse($"{m.Groups["y"].Value}-{month:D2}-{int.Parse(m.Groups["d"].Value):D2}", CultureInfo.InvariantCulture, DateTimeStyles.None, out var d))
        return d;
    return null;
}
foreach (var s in new[] { "4 Giugno 2025", "15 Dicembre 2023", "4 June 2025", "04/06/2025", "2025-06-04", "7 Dicembre 2019", "14.05" })
    Console.WriteLine($"  '{s}' -> {(ParseSdsDate(s, MonthNameDateRegex, MonthNumbers)?.ToString("yyyy-MM-dd") ?? "null")}");

Console.WriteLine("== DensityWithoutUnit ==");
var DensityUnitRegex = new Regex(@"\b(g\s*/\s*cm|kg\s*/\s*(?:m|l)|g\s*/\s*(?:m|l)\b|g/ml)", RegexOptions.IgnoreCase | RegexOptions.Compiled);
foreach (var d in new[] { "1.4", "0,84", ">1.4", "0,84 g/cm³", "840 kg/m³", "Non disponibile", "5.04 (Aria = 1)" })
{
    var hasUnit = DensityUnitRegex.IsMatch(d);
    var bare = Regex.IsMatch(d, @"^\s*[<>≤≥=]?~?\s*\d+(?:[.,]\d+)?\s*$");
    Console.WriteLine($"  '{d}' -> unit={hasUnit} bare={bare} nota={(hasUnit || !bare ? "no" : "SI")}");
}
