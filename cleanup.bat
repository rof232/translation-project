@echo off
echo ========================================
echo Novel Translator - Cleanup Utility
echo ========================================
echo.

:: تعيين مسار المشروع
set "PROJECT_PATH=%~dp0"
cd /d "%PROJECT_PATH%"

echo Phase 1: Stopping Processes
echo --------------------------
:: إيقاف عمليات Node.js
taskkill /F /IM node.exe 2>nul
taskkill /F /IM npm.exe 2>nul
timeout /t 2 /nobreak > nul

:: إيقاف عمليات Python
taskkill /F /IM python.exe 2>nul
taskkill /F /IM python3.exe 2>nul
timeout /t 2 /nobreak > nul

:: إيقاف عمليات Rust
taskkill /F /IM rustc.exe 2>nul
taskkill /F /IM cargo.exe 2>nul
taskkill /F /IM rust-analyzer.exe 2>nul
timeout /t 2 /nobreak > nul

:: إيقاف عمليات التطبيق
taskkill /F /IM novel-translator.exe 2>nul
timeout /t 2 /nobreak > nul

echo Phase 2: Cleaning Build Directories
echo ---------------------------------
:: تنظيف مجلدات Node.js
if exist "node_modules" (
    echo Removing node_modules...
    rd /s /q "node_modules"
)
if exist "dist" (
    echo Removing dist...
    rd /s /q "dist"
)

:: تنظيف مجلدات Python
if exist "backend\__pycache__" (
    echo Removing Python cache...
    rd /s /q "backend\__pycache__"
)
if exist "backend\.pytest_cache" rd /s /q "backend\.pytest_cache"
if exist ".venv" rd /s /q ".venv"

:: تنظيف مجلدات Rust/Tauri
if exist "src-tauri\target" (
    echo Removing Rust target...
    rd /s /q "src-tauri\target"
)
if exist ".tauri" rd /s /q ".tauri"

echo Phase 3: Cleaning Temporary Files
echo -------------------------------
:: حذف ملفات السجلات
del /f /q "*.log" 2>nul
del /f /q "backend\*.log" 2>nul
del /f /q "npm-debug.log*" 2>nul
del /f /q "yarn-debug.log*" 2>nul
del /f /q "yarn-error.log*" 2>nul

:: حذف الملفات المؤقتة
del /f /q "*.tmp" 2>nul
del /f /q "*.temp" 2>nul
del /f /q ".env.local" 2>nul

echo Phase 4: Final Checks
echo -------------------
:: التحقق من المنافذ
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":1420 :3000 :8000"') do (
    echo Stopping port process PID: %%a
    taskkill /F /PID %%a 2>nul
)

:: انتظار إضافي للتأكد من إغلاق كل شيء
echo Waiting for all processes to fully terminate...
timeout /t 5 /nobreak > nul

echo ========================================
echo Cleanup Complete!
echo.
echo Please wait 10 seconds before running the installer...
timeout /t 10
exit /b 0
