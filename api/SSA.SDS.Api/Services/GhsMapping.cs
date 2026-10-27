namespace SSA.SDS.Api.Services;

/// <summary>
/// Derivazione dei pittogrammi GHS dalle frasi H (CLP, Allegato I).
/// Usata solo quando la SDS non riporta i codici GHS nella sezione 2.2:
/// il codice scritto nella SDS resta sempre prioritario (vedi ImportService).
/// </summary>
public static class GhsMapping
{
    // Frasi H -> pittogrammi GHS secondo CLP (Reg. 1272/2008, Allegato I).
    // Dove una frase è associata a più pittogrammi (es. H315/H319) la scelta
    // viene risolta in DeriveGhsCodes con le regole di esclusione sotto.
    private static readonly Dictionary<string, string[]> HToGhs = new()
    {
        // GHS01 - Esplosivo
        ["H200"] = new[] { "GHS01" },
        ["H201"] = new[] { "GHS01" },
        ["H202"] = new[] { "GHS01" },
        ["H240"] = new[] { "GHS01" },
        ["H241"] = new[] { "GHS01" },
        ["H242"] = new[] { "GHS01" },
        ["H250"] = new[] { "GHS01" },
        ["H251"] = new[] { "GHS01" },
        ["H252"] = new[] { "GHS01" },

        // GHS02 - Infiammabile (liquidi/gas/solidi, autoinfiammabili, autoreattivi)
        ["H220"] = new[] { "GHS02" },
        ["H221"] = new[] { "GHS02" },
        ["H222"] = new[] { "GHS02" },
        ["H223"] = new[] { "GHS02" },
        ["H224"] = new[] { "GHS02" },
        ["H225"] = new[] { "GHS02" },
        ["H226"] = new[] { "GHS02" },
        ["H228"] = new[] { "GHS02" },
        ["H229"] = new[] { "GHS02" },
        ["H230"] = new[] { "GHS02" },
        ["H240"] = new[] { "GHS01", "GHS02" }, // esplosivo + pericoloso al contatto con l'acqua (gas infiammabile)
        ["H241"] = new[] { "GHS01", "GHS02" },
        ["H242"] = new[] { "GHS01", "GHS02" },
        ["H260"] = new[] { "GHS02" },
        ["H261"] = new[] { "GHS02" },

        // GHS03 - Comburente
        ["H270"] = new[] { "GHS03" },
        ["H271"] = new[] { "GHS03" },
        ["H272"] = new[] { "GHS03" },

        // GHS04 - Gas sotto pressione
        ["H280"] = new[] { "GHS04" },
        ["H281"] = new[] { "GHS04" },
        ["H282"] = new[] { "GHS04" },

        // GHS05 - Corrosivo (pelle, occhi, metalli)
        ["H314"] = new[] { "GHS05" },
        ["H290"] = new[] { "GHS05" },
        ["H331"] = new[] { "GHS05" }, // corrosivo per le vie respiratorie

        // GHS06 - Tossicità acuta cat. 1-3 (e H334/H335: esclusione in DeriveGhsCodes)
        ["H300"] = new[] { "GHS06" },
        ["H310"] = new[] { "GHS06" },
        ["H330"] = new[] { "GHS06" },
        ["H301"] = new[] { "GHS06" },
        ["H311"] = new[] { "GHS06" },
        ["H332"] = new[] { "GHS06" }, // tossicità acuta cat. 3 per inalazione (CLP associa GHS07, ma la maggior parte delle SDS usa GHS06)

        ["H312"] = new[] { "GHS06" },

        // GHS07 - Irritante/sensibilizzante cutaneo, narcotico (esclusione H334/H335 in DeriveGhsCodes)
        ["H315"] = new[] { "GHS07" },
        ["H318"] = new[] { "GHS07" }, // lesioni oculari gravi: CLP lo associa a GHS05, ma la maggior parte delle SDS usa GHS07; si preferisce GHS07 se non c'è H314
        ["H319"] = new[] { "GHS07" },
        ["H334"] = new[] { "GHS08" }, // sensibilizzante respiratoria: GHS08 (CLP); se la SDS intendeva sensibilizzazione cutanea il pittogramma è GHS07, ma senza contesto si usa GHS08
        ["H335"] = new[] { "GHS07" },
        ["H336"] = new[] { "GHS07" },

        // GHS08 - Pericolo per la salute (sensibilizzante respiratorio, mutageno, cancerogeno, tossico riproduttivo)
        ["H340"] = new[] { "GHS08" },
        ["H341"] = new[] { "GHS08" },
        ["H350"] = new[] { "GHS08" },
        ["H351"] = new[] { "GHS08" },
        ["H360"] = new[] { "GHS08" },
        ["H361"] = new[] { "GHS08" },
        ["H362"] = new[] { "GHS08" },
        ["H370"] = new[] { "GHS08" },
        ["H371"] = new[] { "GHS08" },
        ["H372"] = new[] { "GHS08" },
        ["H373"] = new[] { "GHS08" },

        // GHS09 - Pericoloso per l'ambiente acquatico (acuto o cronico)
        ["H400"] = new[] { "GHS09" },
        ["H410"] = new[] { "GHS09" },
        ["H411"] = new[] { "GHS09" },
        ["H412"] = new[] { "GHS09" },
        ["H413"] = new[] { "GHS09" },
    };

    /// <summary>
    /// Deriva i pittogrammi GHS dall'elenco di frasi H (es. "H225,H319").
    /// Restituisce i codici ordinati e senza duplicati; vuoto se nessuna frase è mappabile.
    /// </summary>
    public static List<string> DeriveGhsCodes(string? hPhrases)
    {
        if (string.IsNullOrWhiteSpace(hPhrases)) return new List<string>();

        var codes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var raw in hPhrases.Split(new[] { ',', ';', ' ' }, StringSplitOptions.RemoveEmptyEntries))
        {
            var code = raw.Trim().ToUpperInvariant();
            if (!code.StartsWith('H')) continue; // ignora EUH e altro
            if (!HToGhs.TryGetValue(code, out var mapped)) continue;

            foreach (var g in mapped) codes.Add(g);
        }

        // H318 (lesioni oculari gravi): CLP associa GHS05, ma la maggior parte delle SDS usa GHS07.
        // Se c'è anche H314 il pittogramma corrosivo è già coperto: si toglie GHS07 per non duplicare.
        var hasH314 = hPhrases.Split(new[] { ',', ';', ' ' }, StringSplitOptions.RemoveEmptyEntries)
            .Any(c => c.Trim().ToUpperInvariant() == "H314");
        if (codes.Contains("GHS07") && hasH314)
            codes.Remove("GHS07");

        return codes.OrderBy(c => c, StringComparer.Ordinal).ToList();
    }

    /// <summary>Unisce i pittogrammi esistenti con quelli derivati, senza duplicati.</summary>
    public static string MergePictograms(string? existing, List<string> derived)
    {
        var all = new List<string>();
        if (!string.IsNullOrWhiteSpace(existing))
            foreach (var p in existing.Split(new[] { ',', ';', ' ' }, StringSplitOptions.RemoveEmptyEntries))
                all.Add(p.Trim());

        foreach (var d in derived)
            if (!all.Any(a => string.Equals(a, d, StringComparison.OrdinalIgnoreCase)))
                all.Add(d);

        return string.Join(", ", all.Distinct(StringComparer.OrdinalIgnoreCase).OrderBy(x => x, StringComparer.Ordinal));
    }
}
