# Smart-Agro Granular Commit & Push PowerShell Script
param (
    [switch]$NoPush = $false
)

$Branch = (git branch --show-current).Trim()
if (-not $Branch) { $Branch = "main" }

$Commits = @(
    @{ Files = @("scripts/check_duplicates.py"); Message = "feat(db): add read-only pre-flight duplicate and index checker script" },
    @{ Files = @("scripts/migrate_lowercase_emails.py"); Message = "feat(db): add lowercase email normalization migration script" },
    @{ Files = @("Backend/requirements.txt"); Message = "deps(backend): add cloudinary SDK for persistent cloud asset storage" },
    @{ Files = @("Backend/.env.example"); Message = "docs(env): document Cloudinary configuration variables in .env.example" },
    @{ Files = @("Frontend/src/context/authContext.jsx"); Message = "security(auth): remove plaintext user PII from localStorage and derive state in memory" },
    @{ Files = @("Frontend/src/pages/auth/Signup.jsx"); Message = "security(signup): eliminate user profile storage in client localStorage" },
    @{ Files = @("Frontend/src/pages/Profile.jsx"); Message = "fix(profile): safely render null and empty profile values without displaying literal null" },
    @{ Files = @("Frontend/src/pages/insights/CropInsights.jsx"); Message = "feat(insights): connect foliage inspection records to live leaf scans API with fallback" },
    @{ Files = @("Backend/app1.py"); Message = "feat(backend): implement unique indexes, hash reset tokens, and integrate Cloudinary storage" },
    @{ Files = @(".gitignore"); Message = "chore(git): ignore temporary test scratch directory" },
    @{ Files = @("DATA_AUDIT.md"); Message = "docs(audit): add comprehensive storage audit report, schema recommendations, and fix log" },
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
        $SuccessCount++
        if (-not $NoPush) {
            Write-Host "  ⬆️ Pushing commit to origin/$Branch..." -ForegroundColor Green
            git push origin $Branch
            Start-Sleep -Seconds 1
        }
    }
}

# Catch any remaining modified or untracked files
$status = git status --porcelain
if ($status) {
    Write-Host "`nStaging any remaining files..." -ForegroundColor Yellow
    git add .
    git diff --cached --quiet
    if ($LASTEXITCODE -ne 0) {
        git commit -m "chore: wrap up remaining project updates and configuration"
        $SuccessCount++
        if (-not $NoPush) {
            git push origin $Branch
        }
    }
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "🎉 Finished! Created $SuccessCount granular commits." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
