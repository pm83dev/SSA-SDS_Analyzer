using PdfSharpCore.Pdf;
using PdfSharpCore.Pdf.Content;
using PdfSharpCore.Pdf.Content.Objects;
using PdfSharpCore.Pdf.IO;
using PdfSharpCore.Pdf.Advanced;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Png;

namespace SSA.SDS.Api.Services;

public record PdfExtractedImage(byte[] PngBytes, int Width, int Height);

// Estrae le immagini incorporate in un PDF (PdfSharpCore): serve per il confronto
// deterministico dei pittogrammi GHS e, in subordine, per l'OCR delle pagine scansionate.
// Le immagini vettoriali (drawn come path) non sono immagini incorporate e non vengono estratte.
public class PdfImageExtractor
{
    public List<PdfExtractedImage> ExtractImages(byte[] pdfBytes)
    {
        var found = new List<PdfExtractedImage>();
        var seen = new HashSet<string>();

        try
        {
            using var document = PdfReader.Open(new MemoryStream(pdfBytes), PdfDocumentOpenMode.Import);
            foreach (var page in document.Pages)
            {
                // Parsa il content stream della pagina
                var parser = new CParser(page);
                var sequence = parser.ReadContent();

                foreach (var obj in sequence)
                {
                    if (obj is not COperator op) continue;
                    if (op.OpCode.OpCodeName != OpCodeName.Do) continue;

                    // L'operando è il nome dell'XObject (es. /Im0)
                    if (op.Operands.Count < 1) continue;
                    var nameObj = op.Operands[0];
                    if (nameObj is not CName cName) continue;
                    var xobjName = cName.Name;

                    // Cerca l'XObject nella resources della pagina
                    var xobjects = page.Resources.Elements.GetDictionary("XObject");
                    if (xobjects == null) continue;

                    var imgObj = xobjects.Elements.GetObject(xobjName);
                    if (imgObj is not PdfImage pdfImage) continue;

                    var xImage = pdfImage.Image;
                    if (xImage == null) continue;

                    var key = xImage.PixelWidth + "x" + xImage.PixelHeight + ":" + xImage.Format;
                    if (!seen.Add(key)) continue;

                    var png = ToPng(xImage);
                    if (png != null)
                        found.Add(new PdfExtractedImage(png, xImage.PixelWidth, xImage.PixelHeight));
                }
            }
        }
        catch
        {
            // PDF non leggibile da PdfSharpCore: nessuna immagine estratta
        }

        return found;
    }

    // Estrae le immagini incorporate in una specifica pagina
    public List<PdfExtractedImage> ExtractImagesFromPage(byte[] pdfBytes, int pageIndex)
    {
        var found = new List<PdfExtractedImage>();
        var seen = new HashSet<string>();

        try
        {
            using var document = PdfReader.Open(new MemoryStream(pdfBytes), PdfDocumentOpenMode.Import);
            if (pageIndex < 0 || pageIndex >= document.Pages.Count) return found;
            var page = document.Pages[pageIndex];

            var parser = new CParser(page);
            var sequence = parser.ReadContent();

            foreach (var obj in sequence)
            {
                if (obj is not COperator op) continue;
                if (op.OpCode.OpCodeName != OpCodeName.Do) continue;

                if (op.Operands.Count < 1) continue;
                var nameObj = op.Operands[0];
                if (nameObj is not CName cName) continue;
                var xobjName = cName.Name;

                var xobjects = page.Resources.Elements.GetDictionary("XObject");
                if (xobjects == null) continue;

                var imgObj = xobjects.Elements.GetObject(xobjName);
                if (imgObj is not PdfImage pdfImage) continue;

                var xImage = pdfImage.Image;
                if (xImage == null) continue;

                var key = xImage.PixelWidth + "x" + xImage.PixelHeight + ":" + xImage.Format;
                if (!seen.Add(key)) continue;

                var png = ToPng(xImage);
                if (png != null)
                    found.Add(new PdfExtractedImage(png, xImage.PixelWidth, xImage.PixelHeight));
            }
        }
        catch
        {
            // PDF non leggibile: nessuna immagine
        }

        return found;
    }

    // Converte l'immagine PDF in PNG usando il metodo nativo di PdfSharpCore
    private static byte[]? ToPng(PdfSharpCore.Drawing.XImage xImage)
    {
        try
        {
            // PdfSharpCore può decodificare JPEG, PNG, JBIG2, raw
            using var pngStream = xImage.AsBitmap();
            return pngStream.ToArray();
        }
        catch
        {
            return null;
        }
    }
}