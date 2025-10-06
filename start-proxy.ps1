# PowerShell script to start the proxy server with environment variables
$env:DATABASE_URL="postgresql://genplay_user:PDM9kI2Z5AePSMWXnbkCD84nsaN7C8Ve@dpg-d3hiishr0fns73cdtvo0-a.oregon-postgres.render.com/genplay_db_w82i"
$env:EMAIL_USER="bei.zhao@genplayai.io"
$env:EMAIL_PASS="koam pjqe kslh qcip"

Write-Host "🚀 Starting GenPlay Proxy Server with environment variables..."
Write-Host "📧 Email: $env:EMAIL_USER"
Write-Host "🗄️ Database: Connected"
Write-Host ""

node proxy-server.js
