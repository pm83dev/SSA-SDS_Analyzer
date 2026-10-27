using PdfSharpCore.Pdf;
using PdfSharpCore.Pdf.IO;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;

namespace SSA.SDS.Api.Services;

// Rasterizza una pagina PDF in PNG per l'OCR dei PDF scansionati.
// PdfSharpCore non ha un renderer vettoriale: per i PDF scansionati (quasi sempre
// solo immagini), estrae le immagini incorporate dalla pagina e le compone in un
// unica immagine PNG. Se la pagina non ha immagini incorporate, restituisce bianco.
//
// Performance: il documento viene aperto UNA volta (PdfDocument) e riusato per tutte
// le pagine. Prima ogni RenderPage riapriva il PDF da zero: per un PDF scansionato di
// N pagine l'apertura avveniva N volte (O(n^2) sul file).
public class PdfPageRenderer
{
    // Apertura singola del documento: da riusare per tutte le pagine
    public PdfSharpCore.Pdf.PdfDocument Open(byte[] pdfBytes) =>
        PdfReader.Open(new MemoryStream(pdfBytes), PdfDocumentOpenMode.Import);

    public byte[] RenderPage(PdfSharpCore.Pdf.PdfDocument document, int pageIndex, int maxDimension = 4000)
    {
        if (pageIndex < 0 || pageIndex >= document.Pages.Count)
            throw new ArgumentOutOfRangeException(nameof(pageIndex));
        var page = document.Pages[pageIndex];
        var widthPt = page.Width.Point;
        var heightPt = page.Height.Point;

        // Risoluzione: 150 DPI, ridotta se l'immagine supera il limite
        var dpi = 150;
        var widthPx = (int)Math.Ceiling(widthPt * dpi / 72.0);
        var heightPx = (int)Math.Ceiling(heightPt * dpi / 72.0);
        while (Math.Max(widthPx, heightPx) > maxDimension)
        {
            dpi -= 25;
            if (dpi < 50) break;
            widthPx = (int)Math.Ceiling(widthPt * dpi / 72.0);
            heightPx = (int)Math.Ceiling(heightPt * dpi / 72.0);
        }

        // Estrae le immagini dalla pagina (documento già aperto: nessuna riapertura)
        var images = PdfImageExtractor.ExtractImagesFromPage(document, pageIndex);

        // Se non ci sono immagini, restituisce un'immagine bianca
        if (images.Count == 0)
        {
            using var blank = new Image<Rgba32>(widthPx, heightPx, new Rgba32(255, 255, 255));
            using var blankStream = new MemoryStream();
            blank.SaveAsPng(blankStream);
            return blankStream.ToArray();
        }

        // Per i PDF scansionati, la prima immagine è quasi sempre la scansione stessa.
        // La restituisce direttamente come PNG (l'OCR non richiede una dimensione
        // specifica: Tesseract gestisce qualsiasi risoluzione).
        return images[0].PngBytes;
    }

    // Versione comoda per una singola pagina (apre e chiude il documento)
    public byte[] RenderPage(byte[] pdfBytes, int pageIndex, int maxDimension = 4000)
    {
        using var document = Open(pdfBytes);
        return RenderPage(document, pageIndex, maxDimension);
    }
}