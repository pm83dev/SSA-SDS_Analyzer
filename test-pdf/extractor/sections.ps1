param([Parameter(Mandatory=$true)][string]$Path)
# Estrazione con layout analysis (DLA) di PdfPig: le colonne delle tabelle non
# vengono incollate, come nel tool di test (extractor/Program.cs)
$t = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
$rx = [regex]'(?im)^\s*(?:SEZIONE|SECTION)\s+(\d{1,2})\s*[.:)]'
Write-Output "len=$($t.Length)"
foreach ($m in $rx.Matches($t)) { "N=$($m.Groups[1].Value) @$($m.Index)" }
