using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using TesseractOCR;
using TesseractOCR.Enums;

namespace SSA.SDS.Api.Services;

public interface IOcrService
{
    // true se l'OCR è disponibile (binari Tesseract + file lingua scaricati)
    bool IsAvailable { get; }
    string? UnavailableReason { get; }

    // Legge il testo da un'immagine (PNG/JPEG/TIFF). Il testo OCR può contenere errori:
    // va sempre controllato e verificato, non è testo nativo del PDF
    string? RecognizeText(Stream image);
}

// OCR locale con Tesseract 5 (libreria TesseractOCR, binari nativi inclusi nel package).
// Usato solo per i PDF scansionati, quando da PdfPig non si estrae nessun testo:
// i caratteri riconosciuti dall'OCR possono avere errori e vanno controllati a mano.
public class OcrService : IOcrService, IDisposable
{
    private readonly string _tessdataPath;
    private readonly string[] _languages;
    private readonly ILogger<OcrService> _logger;
    private Engine? _engine;
    private string? _initError;

    public OcrService(IConfiguration configuration, ILogger<OcrService> logger)
    {
        _logger = logger;

        // I file lingua (es. ita.traineddata) stanno in tessdata/ del progetto (copiati in output)
        _tessdataPath = configuration["Ocr:TessdataPath"] ?? "tessdata";
        if (!Path.IsPathRooted(_tessdataPath))
            _tessdataPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, _tessdataPath));
        _languages = configuration.GetSection("Ocr:Languages").Get<string[]>() ?? new[] { "ita", "eng" };
    }

    public bool IsAvailable => _engine != null;
    public string? UnavailableReason => _initError;

    public string? RecognizeText(Stream image)
    {
        var engine = GetEngine();
        if (engine == null) return null;

        var tempFile = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName() + ".png");
        try
        {
            using (var img = SixLabors.ImageSharp.Image.Load(image))
            {
                img.SaveAsPng(tempFile);
            }

            using var pix = TesseractOCR.Pix.Image.LoadFromFile(tempFile);
            using var page = engine.Process(pix);
            var text = page.Text;
            return string.IsNullOrWhiteSpace(text) ? null : text.Trim();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Errore durante il riconoscimento OCR dell'immagine");
            return null;
        }
        finally
        {
            if (File.Exists(tempFile)) File.Delete(tempFile);
        }
    }

    private Engine? GetEngine()
    {
        if (_engine != null) return _engine;
        lock (this)
        {
            if (_engine != null) return _engine;

            try
            {
                if (!Directory.Exists(_tessdataPath))
                {
                    _initError = $"cartella tessdata non trovata in {_tessdataPath}";
                    _logger.LogWarning("OCR non disponibile: {Reason}", _initError);
                    return null;
                }

                var missing = _languages.Where(l => !File.Exists(Path.Combine(_tessdataPath, $"{l}.traineddata"))).ToList();
                if (missing.Count == _languages.Length)
                {
                    _initError = $"nessun file lingua trovato in {_tessdataPath} (attesi: {string.Join(", ", _languages.Select(l => l + ".traineddata"))})";
                    _logger.LogWarning("OCR non disponibile: {Reason}", _initError);
                    return null;
                }

                var available = _languages.Except(missing).ToList();
                if (missing.Count > 0)
                    _logger.LogWarning("OCR: lingue mancanti {Missing}, uso {Available}",
                        string.Join(", ", missing), string.Join(", ", available));

                _engine = new Engine(_tessdataPath, string.Join('+', available), EngineMode.Default);
                _logger.LogInformation("OCR inizializzato: tessdata={Path} lingue={Langs}", _tessdataPath, string.Join("+", available));
                return _engine;
            }
            catch (Exception ex)
            {
                _initError = ex.Message;
                _logger.LogError(ex, "Errore nell'inizializzazione di Tesseract: l'OCR non sarà disponibile");
                return null;
            }
        }
    }

    public void Dispose()
    {
        _engine?.Dispose();
        _engine = null;
    }
}