# =========================================
#  Auto GitHub Pages Multi-App Deployer
# =========================================
# Works for multiple React (TSX) apps in subfolders
# Example structure:
# My-Projects/
# ├─ TaskFlow_Web/
# ├─ ShopHub_Web/
# ├─ docs/
# └─ deploy.ps1

$ErrorActionPreference = "Stop"

# GitHub username and repo name (edit only if needed)
$githubUser = "PrinceSanchela"
$repoName = "My-Projects"

# List of your apps (folder names)
$apps = @("TaskFlow_Web", "E-commerce_web_ShopHub")

Write-Host " Starting deployment for $repoName..."

# Ensure docs folder exists
if (-not (Test-Path ".\docs")) {
    New-Item -ItemType Directory -Path ".\docs" | Out-Null
}

foreach ($app in $apps) {
    Write-Host "`n Building $app..."

    $appPath = ".\$app"
    $buildPath = "$appPath\build"
    $targetPath = ".\docs\$app"
    $packageJson = "$appPath\package.json"

    # 1️ Update homepage field in package.json
    if (Test-Path $packageJson) {
        $json = Get-Content $packageJson | Out-String | ConvertFrom-Json
        $newHomepage = "https://$githubUser.github.io/$repoName/$app"
        $json.homepage = $newHomepage
        $json | ConvertTo-Json -Depth 100 | Set-Content $packageJson -Encoding UTF8
        Write-Host "   Set homepage: $newHomepage"
    }
    else {
        Write-Host "   Skipped homepage update (no package.json found)."
    }

    # 2️ Build the app
    if (Test-Path $appPath) {
        Set-Location $appPath
        npm run build
        Set-Location ..

        # 3️ Create target docs subfolder
        if (-not (Test-Path $targetPath)) {
            New-Item -ItemType Directory -Path $targetPath | Out-Null
        }

        # 4️ Copy build files into docs/<app>/
        if (Test-Path $buildPath) {
            Remove-Item -Recurse -Force $targetPath -ErrorAction Ignore
            New-Item -ItemType Directory -Path $targetPath | Out-Null
            Copy-Item -Path "$buildPath\*" -Destination $targetPath -Recurse
            Write-Host "   Copied build to docs/$app"
        }
        else {
            Write-Host "   Build folder not found for $app!"
        }
    }
    else {
        Write-Host "   App folder $app not found!"
    }
}

Write-Host "`n Committing and pushing changes to GitHub..."

git add docs
git commit -m " Auto-deploy updates to GitHub Pages"
git push origin main

Write-Host "`n Done! Your apps should appear at:"
foreach ($app in $apps) {
    Write-Host "   🌐 https://$githubUser.github.io/$repoName/$app/"
}
Write-Host ""
