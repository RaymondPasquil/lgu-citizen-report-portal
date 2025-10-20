# Remove common session environment variables so Prisma will load .env from project root
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:PGSSLMODE -ErrorAction SilentlyContinue
Remove-Item Env:SHADOW_DATABASE_URL -ErrorAction SilentlyContinue

Write-Host "Session env cleared. Showing current DATABASE_URL (should be empty):" -ForegroundColor Yellow
Write-Host $Env:DATABASE_URL

# Change to project root (script assumed in scripts\)
Set-Location -Path (Join-Path $PSScriptRoot "..")

# Show .env file (first lines) for quick check
if (Test-Path ".env") {
  Write-Host ".env (first 3 lines):" -ForegroundColor Cyan
  Get-Content .env -TotalCount 3
} else {
  Write-Host ".env not found in project root." -ForegroundColor Red
}

# Run Prisma push (this will load the .env)
npx prisma db push
