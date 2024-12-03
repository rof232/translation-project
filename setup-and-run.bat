@echo off
echo Novel Translator Setup and Run
echo ============================
cd /d "%~dp0"

echo Checking for Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed! Please install Node.js first.
    pause
    exit
)

echo Installing dependencies...
call npm install

echo Building the application...
call npm run tauri build

echo Starting the application...
cd src-tauri\target\release
start novel-translator.exe

echo Done! The application should be running now.
pause
