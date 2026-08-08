@echo off
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
cd /d "C:\Saas_Application"
echo Starting WarrantyWise Next.js App on http://localhost:3000 ...
npm run dev -- -p 3000
pause
