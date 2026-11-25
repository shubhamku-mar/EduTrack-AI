@echo off
setlocal enabledelayedexpansion

title SIH26037 - Student Risk Analytics System Launcher

echo ===============================================================================
echo   PROJECT: Hierarchical Clustering of Longitudinal Attendance and Grade-Trend Data
echo   PROJECT ID: SIH26037
echo   DEVELOPER: Shubham Kumar (Reg No: RK3P24UKB35)
echo   INSTITUTION: Lovely Professional University
echo ===============================================================================
echo.

:: 1. Verify Python installation
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not in your system PATH.
    echo Please install Python 3.10+ from python.org and add it to PATH.
    pause
    exit /b 1
)
echo [OK] Python detected.

:: 2. Verify Node.js installation
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in your system PATH.
    echo Please install Node.js from nodejs.org and add it to PATH.
    pause
    exit /b 1
)
echo [OK] Node.js detected.

:: 3. Setup Python dependencies
echo [INFO] Verifying backend Python packages...
python -c "import fastapi, uvicorn, pydantic, sqlalchemy, pandas, numpy, sklearn, scipy" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [INFO] Installing required Python packages...
    python -m pip install -r requirements.txt
    if %ERRORLEVEL% neq 0 (
        echo [WARNING] Global install failed. Attempting with --break-system-packages...
        python -m pip install --break-system-packages -r requirements.txt
    )
)
echo [OK] Python dependencies verified.

:: 4. Setup Frontend dependencies
if not exist "frontend\node_modules\" (
    echo [INFO] Installing frontend packages (this may take a minute on first launch)...
    cd frontend
    call npm install --legacy-peer-deps
    cd ..
)
echo [OK] Frontend dependencies verified.

:: 5. Launch Backend Server in background
echo.
echo ===============================================================================
echo   Starting Backend API Server (FastAPI + Uvicorn) on http://127.0.0.1:8000
echo   Starting Frontend UI (Vite + React) on http://localhost:5173
echo ===============================================================================
echo.

start "SIH26037-Backend-API" cmd /k "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

:: 6. Launch Frontend Server
cd frontend
start "SIH26037-Frontend-UI" cmd /k "npm run dev"
cd ..

echo [SUCCESS] Both servers are launching in separate windows!
echo - Access the Web Application at: http://localhost:5173
echo - Access the Backend API Docs at: http://127.0.0.1:8000/docs
echo.
echo Keep both terminal windows open while using the application.
pause
