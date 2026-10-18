using SSA.SDS.Api.Data;

namespace SSA.SDS.Api.Services;

public class ExpirationWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ExpirationWorker> _logger;

    public ExpirationWorker(IServiceScopeFactory scopeFactory, ILogger<ExpirationWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromHours(1));
        do
        {
            try
            {
                await RunAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore nel job di aggiornamento scadenze");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task RunAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var expiration = scope.ServiceProvider.GetRequiredService<IExpirationService>();
        await expiration.RecalculateCardStatusesAsync();
        await expiration.GenerateNotificationsAsync();
    }
}
