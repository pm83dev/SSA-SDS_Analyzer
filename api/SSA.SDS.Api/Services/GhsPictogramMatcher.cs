using System.Text.RegularExpressions;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace SSA.SDS.Api.Services;

public record GhsMatch(string Code, string? Name, double Similarity);

// Riconosce i 9 pittogrammi GHS nelle immagini estratte da un PDF, confrontandole con
// le 9 immagini di riferimento ritagliate dal foglio "Pittogrammi" dell'Excel
// (wwwroot/ghs/GHS01.png ... GHS09.png). E un controllo deterministico (somiglianza a
// livello di pixel, senza modello): non puo inventare, trova solo cio che assomiglia.
//
// Il confronto e invariante rispetto a dimensione, traslazione e colore: ogni immagine
// viene ridotta a 1 bit (nero/bianco), ritagliata sul bounding box del contenuto, privata della cornice a rombo e
// riportata a RefSize x RefSize. Senza questa normalizzazione due versioni dello stesso
// simbolo (una piu grande, una piu spostata nell'immagine) non superano mai la soglia
// di similarita e i pittogrammi non vengono mai riconosciuti.
public class GhsPictogramMatcher
{
    // Similarita (0..1) sotto la quale due immagini non sono considerate lo stesso pittogramma.
    // Con la normalizzazione a 1 bit + bounding box, versioni diverse dello stesso simbolo
    // ottengono 0.85-0.95 e simboli diversi restano sotto 0.80: 0.75 e il compromesso.
    private const double MinSimilarity = 0.75;
    // Le immagini di riferimento sono ridimensionate a questa dimensione per il confronto
    private const int RefSize = 48;
    private const int MaxInputSize = 4096;
    // Soglia di binarizzazione (0..255): sotto e "nero". I simboli nelle SDS possono essere
    // stampati in blu o nero scuro: il colore esatto non conta, conta il disegno.
    private const byte BlackThreshold = 160;
    // Rifiuta se meno dell'1% dei pixel e nero: non contiene un simbolo
    private const double MinInkRatio = 0.01;

    private readonly (string Code, string? Name, byte[]? Pixels)[] _references;

    public GhsPictogramMatcher(IEnumerable<(string Code, string? Name, byte[] PngBytes)> references)
    {
        _references = references
            .Select(r => (Code: r.Code, Name: r.Name, Pixels: LoadPixels(r.PngBytes)))
            .Where(r => r.Pixels != null)
            .ToArray();
    }

    // Costruisce l'elenco dei 9 pittogrammi dalle immagini in wwwroot/ghs (le stesse
    // mostrate nel frontend, ritagliate dal foglio "Pittogrammi" dell'Excel)
    public static GhsPictogramMatcher FromDirectory(string ghsFolder)
    {
        var refs = new List<(string, string?, byte[])>();
        var names = GhsNames();
        foreach (var file in Directory.EnumerateFiles(ghsFolder, "GHS*.png", SearchOption.TopDirectoryOnly))
        {
            var m = Regex.Match(Path.GetFileName(file), @"^GHS0?(\d{1,2})\.png$", RegexOptions.IgnoreCase);
            if (!m.Success) continue;
            refs.Add(($"GHS0{m.Groups[1].Value}", names[$"GHS0{m.Groups[1].Value}"], File.ReadAllBytes(file)));
        }
        return new GhsPictogramMatcher(refs);
    }

    // Confronta l'immagine con i 9 pittogrammi di riferimento e restituisce quelli riconosciuti
    public List<GhsMatch> FindMatches(byte[] imageBytes)
    {
        var pixels = LoadPixels(imageBytes);
        if (pixels == null) return new List<GhsMatch>();

        var matches = new List<GhsMatch>();
        foreach (var item in _references)
        {
            if (item.Pixels == null) continue;
            var similarity = Similarity(pixels, item.Pixels);
            if (similarity >= MinSimilarity)
                matches.Add(new GhsMatch(item.Code, item.Name, Math.Round(similarity, 3)));
        }
        return matches;
    }
    // Riduce l'immagine a 1 bit, la ritaglia sul contenuto e la riporta a RefSize x RefSize.
    // Ritorna null se l'immagine non e leggibile o non contiene un simbolo disegnabile.
    private static byte[]? LoadPixels(byte[] bytes)
    {
        try
        {
            using var image = Image.Load<Rgba32>(bytes);
            var w = image.Width;
            var h = image.Height;
            if (w < 16 || h < 16) return null; // troppo piccolo: non e un pittogramma
            if (w > MaxInputSize || h > MaxInputSize) return null; // corrotta/non immagine

            // Binarizza e conta l'inchiostro (pixel non bianchi)
            var black = new bool[w * h];
            var ink = 0;
            for (var y = 0; y < h; y++)
            {
                for (var x = 0; x < w; x++)
                {
                    var p = image[x, y];
                    if (p.A < 128) continue; // trasparente: non e inchiostro
                    var gray = (p.R * 299 + p.G * 587 + p.B * 114) / 1000;
                    if (gray < BlackThreshold) { black[y * w + x] = true; ink++; }
                }
            }
            if (ink < w * h * MinInkRatio) return null; // bianco quasi totale: non c'e un simbolo

            // Bounding box del contenuto: il simbolo puo essere in un angolo dell'immagine
            // (es. dentro una cornice) e il confronto non deve dipendere dalla posizione
            var minX = w; var minY = h; var maxX = -1; var maxY = -1;
            for (var y = 0; y < h; y++)
            {
                for (var x = 0; x < w; x++)
                {
                    if (!black[y * w + x]) continue;
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
            var bw = maxX - minX + 1;
            var bh = maxY - minY + 1;
            if (bw < 4 || bh < 4) return null; // troppo sottile per essere un simbolo

            // Rimuovi la cornice a rombo: tutti i 9 pittogrammi GHS hanno lo stesso rombo
            // esterno, quindi confrontando l'immagine intera ogni simbolo assomiglia a tutti
            // gli altri (similarita 0.80-0.90). Ritagliando i bordi (24%) resta solo il
            // simbolo interno, che e diverso per ogni pittogramma.
            var inset = (int)(Math.Min(bw, bh) * 0.24);
            var x0 = minX + inset; var y0 = minY + inset;
            var x1 = maxX - inset; var y1 = maxY - inset;
            if (x1 - x0 < 4 || y1 - y0 < 4) { x0 = minX; y0 = minY; x1 = maxX; y1 = maxY; }
            var cw = x1 - x0 + 1;
            var ch = y1 - y0 + 1;

            // Ritaglia e ridimensiona a RefSize x RefSize (il resize ri-binarizza l'anti-aliasing)
            using var crop = new Image<Rgba32>(cw, ch);
            for (var y = 0; y < ch; y++)
            {
                for (var x = 0; x < cw; x++)
                    crop[x, y] = black[(y + y0) * w + x + x0] ? new Rgba32(0, 0, 0) : new Rgba32(255, 255, 255);
            }
            crop.Mutate(x => x.Resize(new ResizeOptions { Size = new SixLabors.ImageSharp.Size(RefSize, RefSize) }));

            var result = new byte[RefSize * RefSize];
            for (var i = 0; i < result.Length; i++)
            {
                var p = crop[i % RefSize, i / RefSize];
                result[i] = (byte)((p.R * 299 + p.G * 587 + p.B * 114) / 1000 < BlackThreshold ? 1 : 0);
            }
            return result;
        }
        catch
        {
            return null;
        }
    }

    // Frazione di pixel uguali (1 bit): 1.0 = identici
    private static double Similarity(byte[] a, byte[] b)
    {
        var equal = 0;
        for (var i = 0; i < a.Length; i++)
            if (a[i] == b[i]) equal++;
        return equal / (double)a.Length;
    }

    // Nomi dei pittogrammi: stessi del frontend (core/models/sds-fields.ts, foglio "Pittogrammi")
    private static Dictionary<string, string> GhsNames() => new()
    {
        ["GHS01"] = "Esplosivo",
        ["GHS02"] = "Infiammabile",
        ["GHS03"] = "Comburente",
        ["GHS04"] = "Gas sotto pressione",
        ["GHS05"] = "Corrosivo",
        ["GHS06"] = "Tossicita acuta (categorie 1, 2 e 3)",
        ["GHS07"] = "Tossicita acuta (altre categorie), sensibilizzante cutaneo, irritante, narcotico",
        ["GHS08"] = "Pericoloso per la salute: sensibilizzante respiratorio, mutageno, cancerogeno, tossico per la riproduzione",
        ["GHS09"] = "Pericoloso per l'ambiente"
    };

    // Mappatura standard CLP/GHS tra frasi H e pittogrammi GHS.
    // Quando nel testo della SDS non ci sono i codici GHS scritti e le immagini non sono
    // estraibili (pittogrammi vettoriali), i pittogrammi vengono dedotti dalle frasi H
    // usando questa tabella deterministica della normativa.
    public static HashSet<string> PictogramsFromHPhrases(string? hPhrases)
    {
        if (string.IsNullOrWhiteSpace(hPhrases)) return new HashSet<string>();

        var pictograms = new HashSet<string>();
        var codes = Regex.Matches(hPhrases, @"H\s*(\d{3}[a-d]?)(?:\s*,\s*|\s*;|\s+)")
            .Select(m => "H" + m.Groups[1].Value.ToUpperInvariant())
            .Union(Regex.Matches(hPhrases, @"H\s*(\d{3}[a-d]?)\b")
                .Select(m => "H" + m.Groups[1].Value.ToUpperInvariant()));

        foreach (var code in codes.Distinct())
        {
            foreach (var pictogram in HPhraseToPictogram(code))
                pictograms.Add(pictogram);
        }

        return pictograms;
    }

    // Tabella CLP/GHS: per ogni frase H i pittogrammi corrispondenti
    private static IEnumerable<string> HPhraseToPictogram(string code)
    {
        // Rimuovi eventuali suffissi (es. H350i -> H350)
        var baseCode = Regex.Replace(code, @"[a-d]$", "", RegexOptions.IgnoreCase);

        switch (baseCode)
        {
            // GHS01: Esplosivi
            case "H200": case "H201": case "H202": case "H203":
            case "H204": case "H205": case "H206": case "H207": case "H208":
                yield return "GHS01";
                break;

            // GHS02: Infiammabili
            case "H220": case "H221": case "H222": case "H223":
            case "H224": case "H225": case "H226": case "H227":
            case "H228": case "H229":
            case "H230": case "H231": case "H232":
            case "H240": case "H241": case "H242":
            case "H250": case "H251": case "H252":
            case "H260": case "H261":
                yield return "GHS02";
                break;

            // GHS03: Comburenti
            case "H270": case "H271": case "H272":
                yield return "GHS03";
                break;

            // GHS04: Gas sotto pressione
            case "H280": case "H281": case "H282":
                yield return "GHS04";
                break;

            // GHS05: Corrosivi
            case "H314": case "H318":
                yield return "GHS05";
                break;

            // GHS06: Tossicità acuta (categorie 1, 2, 3)
            case "H300": case "H310": case "H330":
            case "H301": case "H311": case "H331":
                yield return "GHS06";
                break;

            // GHS07: Tossicità acuta (altre categorie), irritante, sensibilizzante
            case "H302": case "H312": case "H332":
            case "H305": case "H315": case "H319":
            case "H335": case "H336":
            case "H317":
                yield return "GHS07";
                break;

            // GHS08: Pericoloso per la salute
            case "H334":
            case "H340": case "H341":
            case "H350": case "H351":
            case "H360": case "H361":
            case "H370": case "H371": case "H372": case "H373":
                yield return "GHS08";
                break;

            // GHS09: Pericoloso per l'ambiente
            case "H400": case "H401": case "H402":
            case "H410": case "H411": case "H412": case "H413":
                yield return "GHS09";
                break;
        }
    }
}


