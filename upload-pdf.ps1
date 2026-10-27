param(
    [string]$TokenFile = "token.txt",
    [string]$PdfPath
)

Add-Type -AssemblyName System.Net.Http

$token = (Get-Content $TokenFile -Raw).Trim()

$fileName = [System.IO.Path]::GetFileName($PdfPath)
$fileBytes = [System.IO.File]::ReadAllBytes($PdfPath)

$handler = New-Object System.Net.Http.HttpClientHandler
$client = New-Object System.Net.Http.HttpClient($handler)
$client.Timeout = [TimeSpan]::FromSeconds(300)
$client.DefaultRequestHeaders.Authorization = New-Object System.Net.Http.Headers.HttpAuthenticationHeaderValue("Bearer", $token)

$content = New-Object System.Net.Http.MultipartFormDataContent
$content.Add((New-Object System.Net.Http.ByteArrayContent(,$fileBytes)), '"pdfFile"', "`"$fileName`"")

$resp = $client.PostAsync("http://localhost:5007/api/safety-cards/analyze-pdf", $content).Result
Write-Output "Status: $([int]$resp.StatusCode)"
Write-Output $resp.Content.ReadAsStringAsync().Result
