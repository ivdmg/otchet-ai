param([string]$Source,[string]$Target)
$ErrorActionPreference = 'Stop'
$word = $null
$document = $null
$watchdog = $null
$before = @(Get-Process WINWORD -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id)
try {
    $word = New-Object -ComObject Word.Application
    $created = @(Get-Process WINWORD -ErrorAction SilentlyContinue | Where-Object { $before -notcontains $_.Id })
    $wordProcessId = if ($created.Count -eq 1) { $created[0].Id } else { 0 }
    if (!$wordProcessId -or $before -contains $wordProcessId) {
        [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word)
        $word = $null
        throw 'word_instance_not_isolated'
    }
    # The watchdog owns only the newly created converter process. It survives a
    # blocked COM call, never kills any pre-existing owner Word window.
    $watchdog = Start-Job -ArgumentList $wordProcessId -ScriptBlock {
        param($converterId)
        $deadline = (Get-Date).AddSeconds(110)
        while ($true) {
            $process = Get-Process -Id $converterId -ErrorAction SilentlyContinue
            if (!$process) { break }
            if ((Get-Date) -gt $deadline -or $process.WorkingSet64 -gt 536870912) {
                Stop-Process -Id $converterId -Force -ErrorAction SilentlyContinue
                break
            }
            Start-Sleep -Seconds 1
        }
    }
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $word.AutomationSecurity = 3
    $word.Options.UpdateLinksAtOpen = $false
    $document = $word.Documents.Open($Source, $false, $false, $false)
    # PAGEREF-based contents works without Word outline headings/collapse controls.
    [void]$document.Fields.Update()
    $document.Repaginate()
    [void]$document.Fields.Update()
    $document.Repaginate()
    $document.Save()
    $document.ExportAsFixedFormat($Target, 17)
} finally {
    if ($document) { try {$document.Close([ref]0)} catch {}; [void][Runtime.InteropServices.Marshal]::ReleaseComObject($document) }
    if ($word) { try {$word.Quit([ref]0)} catch {}; [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
    if ($watchdog) { Stop-Job $watchdog; Remove-Job $watchdog }
}
