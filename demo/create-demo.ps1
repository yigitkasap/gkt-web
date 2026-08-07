Write-Host "Demo build olusturuluyor..."

# Build
Set-Location ..
npm run build

# Demo klasoru
if (Test-Path demo/dist) { Remove-Item -Recurse -Force demo/dist }
Copy-Item -Recurse dist demo/dist

# Demo flag inject
$html = Get-Content demo/dist/index.html -Raw
$html = $html.Replace('<head>', '<head><script>window.__DEMO_MODE__=true;</script>')
Set-Content demo/dist/index.html $html -NoNewline

# .htaccess
@"
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
"@ | Set-Content demo/dist/.htaccess

# robots.txt - demo siteyi indeksleme
@"
User-agent: *
Disallow: /
"@ | Set-Content demo/dist/robots.txt

Write-Host ""
Write-Host "Demo build hazir: demo/dist/"
Write-Host "Hostinger'a demo/dist/ icindeki dosyalari yukle."
Write-Host "Admin panel: /admin (otomatik demo modda acilir)"
