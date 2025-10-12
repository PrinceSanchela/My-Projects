# ============================================
# PowerShell Deployment Script (Safe Version)
# For multiple React/TypeScript apps -> GitHub Pages (/docs)
# ============================================

Write-Host ""
Write-Host "=== Starting GitHub Pages deployment ===" -ForegroundColor Cyan

# ---- Configuration ----
$apps = @(
    @{ Name = "E-commerce_web_ShopHub"; Folder = "E-commerce_web_ShopHub" },
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
    $targetPath = Join-Path $docsPath $name

    Write-Host ""
    Write-Host "Building $name..." -ForegroundColor Yellow

    if (!(Test-Path $appPath)) {
        Write-Host "ERROR: Folder not found: $appPath" -ForegroundColor Red
        continue
    }

    Set-Location $appPath

    if (!(Test-Path "package.json")) {
        Write-Host "ERROR: package.json not found in $folder! Skipping..." -ForegroundColor Red
        continue
    }

    # ---- Install and build ----
    npm install
    npm run build

    # ---- Detect build folder ----
    $buildPath = ""
    if (Test-Path (Join-Path $appPath "build")) {
        $buildPath = Join-Path $appPath "build"
    }
    elseif (Test-Path (Join-Path $appPath "dist")) {
        $buildPath = Join-Path $appPath "dist"
    }
    else {
        Write-Host "ERROR: No 'build' or 'dist' folder found in $folder! Skipping..." -ForegroundColor Red
        continue
    }

    # ---- Clean old build ----
    Write-Host "Cleaning old build in $targetPath..." -ForegroundColor Gray
    Remove-Item -Recurse -Force $targetPath -ErrorAction Ignore
    New-Item -ItemType Directory -Force -Path $targetPath | Out-Null

    # ---- Copy new build ----
    Write-Host "Copying new build files..." -ForegroundColor Gray
    Copy-Item -Path "$buildPath\*" -Destination $targetPath -Recurse -Force

    Write-Host "SUCCESS: $name build copied to docs/$name" -ForegroundColor Green
}

# ---- Return to repo root ----
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "=== All apps built and copied into /docs successfully ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. git add docs"
Write-Host "2. git commit -m 'Deploy updated apps'"
Write-Host "3. git push origin main"
Write-Host ""
Write-Host "Then visit:"
Write-Host "   https://PrinceSanchela.github.io/E-commerce_web_ShopHub/"
Write-Host "   https://PrinceSanchela.github.io/TaskFlow_Web/"
Write-Host ""
Write-Host "Done!"
