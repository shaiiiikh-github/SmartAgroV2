# Smart-Agro Granular Commit & Push PowerShell Script
param (
    [switch]$NoPush = $false
)

$Branch = (git branch --show-current).Trim()
if (-not $Branch) { $Branch = "main" }

$Commits = @(
    @{ Files = @("Frontend/src/i18n/en.json", "Frontend/src/i18n/gu.json", "Frontend/src/i18n/hi.json"); Message = "i18n(dashboard): add camera capture and device upload translation keys for EN, HI, GU" },
    @{ Files = @("Frontend/src/pages/Dashboard.jsx"); Message = "feat(dashboard): add dual upload and camera capture options for leaf diagnosis" },
    @{ Files = @("commit_and_push.py", "commit_and_push.ps1"); Message = "chore(scripts): update automated granular commit and push scripts" }
)

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🚀 Smart-Agro Granular Commit & Push (PowerShell)" -ForegroundColor Cyan
Write-Host "📌 Branch: $Branch | Total Commits: $($Commits.Count)" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$SuccessCount = 0

for ($i = 0; $i -lt $Commits.Count; $i++) {
    $item = $Commits[$i]
    $step = $i + 1
    Write-Host "`n[$step/$($Commits.Count)] Committing: $($item.Message)" -ForegroundColor Yellow

    # Add specific files
    foreach ($f in $item.Files) {
        git add $f 2>$null
    }

    # Check if anything is staged
    git diff --cached --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ℹ️ No changes staged for this commit, skipping..." -ForegroundColor Gray
        continue
    }

    # Commit
    git commit -m $item.Message
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✅ Committed successfully." -ForegroundColor Green
        $SuccessCount++

        if (-not $NoPush) {
            Write-Host "    ⬆️ Pushing commit $step to origin/$Branch..." -ForegroundColor Yellow
            git push origin $Branch
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    ✅ Pushed successfully." -ForegroundColor Green
            } else {
                Write-Host "    ❌ Push failed." -ForegroundColor Red
            }
            Start-Sleep -Seconds 1
        }
    } else {
        Write-Host "    ❌ Commit failed." -ForegroundColor Red
    }
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "🎉 Process Complete: $SuccessCount commits processed." -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
