#!/bin/bash
# SIH26037 - Student Risk Analytics System Launcher
echo "==============================================================================="
echo "  PROJECT: Hierarchical Clustering of Longitudinal Attendance and Grade-Trend Data"
echo "  PROJECT ID: SIH26037"
echo "  DEVELOPER: Shubham Kumar (Reg No: RK3P24UKB35)"
echo "  INSTITUTION: Lovely Professional University"
echo "==============================================================================="

# Verify Python
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] python3 is not installed or not in PATH."
    exit 1
fi

# Verify Node
if ! command -v node &> /dev/null; then
    echo "[ERROR] node is not installed or not in PATH."
    exit 1
fi

# Install dependencies if needed
python3 -m pip install -r requirements.txt || python3 -m pip install --break-system-packages -r requirements.txt

if [ ! -d "frontend/node_modules" ]; then
    echo "[INFO] Installing frontend npm packages..."
    cd frontend && npm install --legacy-peer-deps && cd ..
fi

echo "[INFO] Starting Backend API Server on http://127.0.0.1:8000..."
python3 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

echo "[INFO] Starting Frontend UI on http://localhost:5173..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo "Servers launched successfully!"
echo "Web App: http://localhost:5173"
echo "API Docs: http://127.0.0.1:8000/docs"

wait $BACKEND_PID $FRONTEND_PID
