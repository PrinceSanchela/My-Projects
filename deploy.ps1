# ============================================
# PowerShell Deployment Script
# For multiple React apps -> GitHub Pages (/docs)
# ============================================

Write-Host "🚀 Starting deployment..." -ForegroundColor Cyan

# ---- Configuration ----
$apps = @(
    @{ Name = "ShopHub"; Folder = "ShopHub" },
    @{ Name = "TaskFlow_Web"; Folder = "TaskFlow_Web" }
)

$docsPath = Join-Path $PSScriptRoot "docs"

# ---- Ensure docs/ exists ----
if (!(Test-Path $docsPath)) {
    New-Item -ItemType Directory -Path $docsPath | Out-Null
}

# ---- Loop through each app ----
foreach ($app in $apps) {
    $name = $app.Name
    $folder = $app.Folder
    $appPath = Join-Path $PSScriptRoot $folder
    $buildPath = Join-Path $appPath "build"
    $targetPath = Join-Path $docsPath $name

    Write-Host "`n⚙️ Building $name..." -ForegroundColor Yellow
    Set-Location $appPath

    if (!(Test-Path "package.json")) {
        Write-Host "❌ package.json not found in $folder! Skipping..." -ForegroundColor Red
        continue
    }

    npm install
    npm run build

    Write-Host "🧹 Cleaning old build from $targetPath..." -ForegroundColor Gray
    Remove-Item -Recurse -Force $targetPath -ErrorAction Ignore
    New-Item -ItemType Directory -Force -Path $targetPath | Out-Null

    Write-Host "📦 Copying new build files..." -ForegroundColor Gray
    Copy-Item -Path "$buildPath\*" -Destination $targetPath -Recurse -Force

    Write-Host "✅ $name build copied to docs/$name"
}

# ---- Return to repo root ----
Set-Location $PSScriptRoot

Write-Host "`n🎉 All apps built and copied into /docs successfully!" -ForegroundColor Green
Write-Host "Now commit and push:"
Write-Host "   git add docs"
Write-Host "   git commit -m 'Update builds'"
Write-Host "   git push origin main`n"
Write-Host "Then visit: https://PrinceSanchela.github.io/My-Projects/`n"
