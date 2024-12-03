@echo off
echo ========================================
echo Novel Translator - Installation Utility
echo ========================================
echo.

:: تعيين مسار المشروع
set "PROJECT_PATH=%~dp0"
cd /d "%PROJECT_PATH%"

:: التحقق من المتطلبات الأساسية
echo Phase 1: Checking Prerequisites
echo -----------------------------

:: التحقق من Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: التحقق من Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed!
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

:: التحقق من Rust
rustc --version >nul 2>&1
if errorlevel 1 (
    echo Installing Rust...
    start /wait rustup-init.exe -y
)

echo Phase 2: Installing Dependencies
echo -----------------------------

:: تثبيت حزم Node.js
echo Installing Node.js packages...
call npm install
if errorlevel 1 (
    echo Error: Failed to install Node.js packages!
    pause
    exit /b 1
)

:: إنشاء البيئة الافتراضية لـ Python
echo Creating Python virtual environment...
python -m venv .venv
call .venv\Scripts\activate
python -m pip install --upgrade pip

:: تثبيت حزم Python
echo Installing Python packages...
pip install -r backend/requirements.txt
if errorlevel 1 (
    echo Error: Failed to install Python packages!
    pause
    exit /b 1
)

echo Phase 3: Building Application
echo --------------------------

:: بناء التطبيق
echo Building Tauri application...
call npm run desktop-build
if errorlevel 1 (
    echo Error: Failed to build application!
    pause
    exit /b 1
)

echo Phase 4: Creating Environment File
echo ------------------------------

:: إنشاء ملف .env إذا لم يكن موجوداً
if not exist ".env" (
    echo Creating .env file...
    (
        echo VITE_APP_TITLE=Novel Translator
        echo VITE_APP_API_URL=http://localhost:8000
        echo VITE_APP_VERSION=0.1.0
    ) > .env
)

echo Phase 5: Final Setup
echo -----------------

:: إنشاء مجلدات ضرورية
if not exist "logs" mkdir logs
if not exist "data" mkdir data

:: تنظيف الملفات المؤقتة
del /f /q "*.tmp" 2>nul
del /f /q "*.temp" 2>nul

echo ========================================
echo Installation Complete!
echo.
echo To start the application in development mode:
echo npm run desktop
echo.
echo To start the application in production mode:
echo Run the executable in src-tauri/target/release
echo ========================================

:: تشغيل التطبيق تلقائياً
echo Starting application...
start /b npm run desktop

exit /b 0
