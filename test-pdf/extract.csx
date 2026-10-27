using System.Collections.Generic;
using System.IO;
using System.Linq;
using UglyToad.PdfPig;

var pdfPath = @"c:\DEV\SSA-SDS_Analyzer\api\SSA.SDS.Api\uploads\pdf\schede\98_20261026200711_Sigmacover 456 base Z.pdf";
//using var doc = PdfDocument.Open(pdfPath);
var doc = PdfDocument.Open(pdfPath);
var text = string.Join("\n", doc.GetPages().Select(p => p.Text));

// Cerca la sezione 3

var lines = text.Split('\n');
var inSection3 = false;
var section3 = new List<string>();
foreach (var line in lines)
{
    if (line.ToUpper().Contains("SEZIONE 3") || line.ToUpper().Contains("SECTION 3"))
        inSection3 = true;
    if (inSection3)
    {
        section3.Add(line);
        if (line.ToUpper().Contains("SEZIONE 4") || line.ToUpper().Contains("SECTION 4"))
            break;
    }
}
Console.WriteLine(string.Join("\n", section3.Take(80)));