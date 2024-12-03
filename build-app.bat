@echo off
echo Building Novel Translator...
cd /d "%~dp0"
npm run tauri build
echo Build completed! Check the folder: src-tauri/target/release/bundle/msi/
pause
