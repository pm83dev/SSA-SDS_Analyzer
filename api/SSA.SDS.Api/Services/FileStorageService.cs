namespace SSA.SDS.Api.Services;

public interface IFileStorageService
{
    Task<string> SavePdfAsync(int cardId, Stream content, string fileName);
    bool DeletePdf(string relativePath);
    string? GetFilePath(string relativePath);
    string GetBaseUrl();
}

public class FileStorageService : IFileStorageService
{
    private readonly string _rootPath;
    private readonly int _maxFileSizeMB;
    private readonly IConfiguration _configuration;
    private readonly ILogger<FileStorageService> _logger;

    public FileStorageService(IConfiguration configuration, ILogger<FileStorageService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _rootPath = Path.GetFullPath(configuration["FileStorage:UploadPath"] ?? "uploads");
        _maxFileSizeMB = int.TryParse(configuration["FileStorage:MaxFileSizeMB"], out var max) ? max : 20;
        Directory.CreateDirectory(_rootPath);
    }

    // I PDF sono salvati per scheda: una scheda può essere di più clienti o di nessuno
    public async Task<string> SavePdfAsync(int cardId, Stream content, string fileName)
    {
        if (content.Length > _maxFileSizeMB * 1024L * 1024L)
            throw new InvalidOperationException($"File troppo grande (max {_maxFileSizeMB}MB)");

        var safeName = SanitizeFileName(fileName);
        var folder = Path.Combine(_rootPath, "pdf", "schede");
        Directory.CreateDirectory(folder);

        var relativePath = $"pdf/schede/{cardId}_{DateTime.UtcNow:yyyyMMddHHmmss}_{safeName}";
        var fullPath = Path.Combine(_rootPath, relativePath.Replace('/', Path.DirectorySeparatorChar));

        using (var fs = new FileStream(fullPath, FileMode.Create))
        {
            await content.CopyToAsync(fs);
        }

        _logger.LogInformation("PDF salvato: {Path}", fullPath);
        return relativePath;
    }

    public bool DeletePdf(string relativePath)
    {
        var fullPath = GetFilePath(relativePath);
        if (fullPath != null && File.Exists(fullPath))
        {
            File.Delete(fullPath);
            return true;
        }
        return false;
    }

    public string? GetFilePath(string relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath)) return null;

        var cleaned = relativePath.Replace('\\', '/').TrimStart('/');
        var fullPath = Path.GetFullPath(Path.Combine(_rootPath, cleaned));
        if (!fullPath.StartsWith(Path.GetFullPath(_rootPath), StringComparison.Ordinal))
            return null;

        return File.Exists(fullPath) ? fullPath : null;
    }

    public string GetBaseUrl() => "/api/files";

    private static string SanitizeFileName(string fileName)
    {
        var invalid = Path.GetInvalidFileNameChars();
        var clean = new string(fileName.Where(c => !invalid.Contains(c)).ToArray());
        if (clean.Length > 80) clean = clean[..80];
        return string.IsNullOrWhiteSpace(clean) ? "document.pdf" : clean;
    }
}
