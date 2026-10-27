using UglyToad.PdfPig;
using UglyToad.PdfPig.DocumentLayoutAnalysis.PageSegmenter;
using UglyToad.PdfPig.DocumentLayoutAnalysis.WordExtractor;
using System.Text;

var path = args.Length > 1 ? args[1] : @"C:\DEV\SSA-SDS_Analyzer\api\SSA.SDS.Api\uploads\pdf\schede\101_20261026201855_SIGMACOVER 256-435-456-522 HARDENER.pdf";
using var doc = PdfDocument.Open(path);
var sb = new StringBuilder();
foreach (var page in doc.GetPages())
{
    var words = page.GetWords(NearestNeighbourWordExtractor.Instance);
    var blocks = DocstrumBoundingBoxes.Instance.GetBlocks(words);
    foreach (var block in blocks)
    {
        foreach (var line in block.TextLines)
            sb.AppendLine(string.Join(" ", line.Words.Select(w => w.Text)));
        sb.AppendLine();
    }
}
var c = sb.ToString();
File.WriteAllText("hardener.txt", c);
Console.WriteLine($"len={c.Length}");
foreach (var pat in new[] { "SEZIONE 1:", "SEZIONE 2:", "SEZIONE 3:", "SEZIONE 9:", "SEZIONE 16:", "SECTION 1", "SEZIONE 16", "H225", "H314", "H373", "H411", "null", "GHS0" })
{
    var i = c.IndexOf(pat, StringComparison.OrdinalIgnoreCase);
    Console.WriteLine($"{pat} -> {i}");
}
