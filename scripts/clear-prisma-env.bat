:: Clear session env vars so Prisma will read .env, then run prisma push
set DATABASE_URL=
set PGSSLMODE=
set SHADOW_DATABASE_URL=
echo Cleared session DATABASE_URL. Current value:
echo %DATABASE_URL%

:: Change to project root (script lives in scripts\)
cd /d %~dp0\..

if exist .env (
  echo Showing first 3 lines of .env:
  powershell -Command "Get-Content .env -TotalCount 3"
) else (
  echo .env not found in project root.
)

npx prisma db push
