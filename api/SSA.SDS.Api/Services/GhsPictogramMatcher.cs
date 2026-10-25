using System.Text.RegularExpressions;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace SSA.SDS.Api.Services;

public record GhsMatch(string Code, string? Name, double Similarity);

// Riconosce i 9 pittogrammi GHS nelle immagini estratte da un PDF, confrontandole con
// le 9 immagini di riferimento ritagliate dal foglio "Pittogrammi" dell'Excel
// (wwwroot/ghs/GHS01.png ... GHS09.png). È un controllo deterministico (somiglianza a
// livello di pixel, senza modello): non può inventare, trova solo ciò che assomiglia.
public class GhsPictogramMatcher
{
    // Simiglianza (0..1) sotto la quale due immagini non sono considerate lo stesso pittogramma
    private const double MinSimilarity = 0.55;
    // Le immagini di riferimento sono ridimensionate a questa dimensione per il confronto
    private const int RefSize = 32;
    private const int MaxInputSize = 256;

    private readonly (string Code, string? Name, float[]? Pixels)[] _references;

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

    // Ridimensiona l'immagine a RefSize x RefSize e la riduce a una vettore di "toni"
    // (nero/grigio/chiaro): i pittogrammi GHS sono nero su fondo bianco, quindi il colore
    // esatto non conta, conta il disegno. Le immagini con troppo sfondo colorato vengono scartate.
    private static float[]? LoadPixels(byte[] bytes)
    {
        try
        {
            using var image = Image.Load<Rgba32>(bytes);
            var w = image.Width;
            var h = image.Height;
            if (w < 16 || h < 16) return null; // troppo piccolo: non è un pittogramma
            if (w > MaxInputSize || h > MaxInputSize) return null; // troppo grande: è una foto, non un simbolo

            image.Mutate(x => x.Resize(new ResizeOptions
            {
                Size = new SixLabors.ImageSharp.Size(RefSize, RefSize)
            }));

            var pixels = new float[RefSize * RefSize];
            var colored = 0;
            for (var i = 0; i < pixels.Length; i++)
            {
                var p = image[i % RefSize, i / RefSize];
                var r = p.R / 255f;
                var g = p.G / 255f;
                var b = p.B / 255f;
                var max = Math.Max(r, Math.Max(g, b));
                var min = Math.Min(r, Math.Min(g, b));
                if (max > 0.4f && max - min > 0.35f) colored++; // pixel con colore (non grigio)
                var gray = (r + g + b) / 3f;
                pixels[i] = gray < 0.45f ? 0f : gray < 0.75f ? 0.5f : 1f;
            }

            // Lo sfondo colorato (es. una foto) non somiglia a nessun pittogramma
            if (colored > pixels.Length * 0.15f) return null;
            return pixels;
        }
        catch
        {
            return null;
        }
    }

    private static double Similarity(float[] a, float[] b)
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
        ["GHS06"] = "Tossicità acuta (categorie 1, 2 e 3)",
        ["GHS07"] = "Tossicità acuta (altre categorie), sensibilizzante cutaneo, irritante, narcotico",
        ["GHS08"] = "Pericoloso per la salute: sensibilizzante respiratorio, mutageno, cancerogeno, tossico per la riproduzione",
        ["GHS09"] = "Pericoloso per l'ambiente"
    };
}