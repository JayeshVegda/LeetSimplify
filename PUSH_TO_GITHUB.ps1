# Script to push LeetSimplify to GitHub
# Make sure you have created the repository on GitHub first!

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LeetSimplify - Push to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if remote already exists
try {
    $remoteUrl = git remote get-url origin 2>$null
    if ($remoteUrl) {
        Write-Host "Remote 'origin' already exists: $remoteUrl" -ForegroundColor Yellow
        Write-Host ""
        $update = Read-Host "Do you want to update it? (y/n)"
        if ($update -eq "y" -or $update -eq "Y") {
            git remote set-url origin https://github.com/JayeshVegda/LeetSimplify.git
            Write-Host "Remote URL updated." -ForegroundColor Green
        }
    }
} catch {
    Write-Host "Adding remote 'origin'..." -ForegroundColor Yellow
    git remote add origin https://github.com/JayeshVegda/LeetSimplify.git
    Write-Host "Remote added." -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Current Status:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
git status --short
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Recent Commits:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
git log --oneline -5
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Ready to push to GitHub!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Repository: https://github.com/JayeshVegda/LeetSimplify" -ForegroundColor Green
Write-Host "Branch: main" -ForegroundColor Green
Write-Host ""

$confirm = Read-Host "Press Enter to continue, or Ctrl+C to cancel"
Write-Host ""

Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Repository pushed to GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Visit: https://github.com/JayeshVegda/LeetSimplify" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ERROR: Push failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "1. Repository doesn't exist on GitHub yet"
    Write-Host "2. Authentication failed (check your credentials)"
    Write-Host "3. Network connection issue"
    Write-Host ""
    Write-Host "Make sure you:" -ForegroundColor Yellow
    Write-Host "- Created the repository on GitHub first"
    Write-Host "- Have proper authentication set up"
    Write-Host "- Have internet connection"
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

