@echo off
echo Starting Novel Translator in Development Mode...
cd /d "%~dp0"
npm run tauri dev
pause
