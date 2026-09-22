@echo off
cd /d "%~dp0"
if not exist node_modules (
    echo Installing dependencies, this only happens once...
    call npm install
)
echo Starting AMS360 app, your browser will open automatically...
call npm run dev
