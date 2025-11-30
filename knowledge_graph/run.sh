#!/bin/bash

# Knowledge Graph Application - Startup Script
# This script sets up the environment and runs the Flask application

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     Knowledge Graph Application - E-Commerce Network          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7 or higher."
    exit 1
fi

echo "✓ Python version: $(python3 --version)"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "$SCRIPT_DIR/venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv "$SCRIPT_DIR/venv"
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

echo ""

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source "$SCRIPT_DIR/venv/bin/activate"
echo "✓ Virtual environment activated"

echo ""

# Install/upgrade requirements
echo "📥 Installing dependencies..."
pip install --upgrade pip setuptools wheel > /dev/null 2>&1
pip install -r "$SCRIPT_DIR/requirements.txt" > /dev/null 2>&1
echo "✓ Dependencies installed"

echo ""

# Create necessary directories
mkdir -p "$SCRIPT_DIR/data"
mkdir -p "$SCRIPT_DIR/app/templates"
mkdir -p "$SCRIPT_DIR/app/static"

echo ""

# Display information
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🚀 Starting Knowledge Graph Application..."
echo ""
echo "💾 Data Directory: $SCRIPT_DIR/data"
echo "📄 Sample CSV: $SCRIPT_DIR/data/sample_ecommerce.csv"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🎯 Features:"
echo "   • Add relationships manually"
echo "   • Upload CSV files for bulk import"
echo "   • Query and visualize the graph"
echo "   • Find paths between entities"
echo "   • Search by relationship type"
echo "   • Export graph as JSON"
echo ""
echo "📚 How to use:"
echo "   1. Open http://localhost:PORT in your browser (see URL below)"
echo "   2. Add relationships using the left panel"
echo "   3. Upload sample_ecommerce.csv for demo data"
echo "   4. Use query tools to explore the graph"
echo ""
echo "🛑 To stop the server, press Ctrl+C"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""

# Find available port (try 8080, 8081, 8082... as 5000 is often used by AirPlay on macOS)
PORT=8080
MAX_PORT=8100
while lsof -i :$PORT >/dev/null 2>&1; do
    if [ $PORT -ge $MAX_PORT ]; then
        echo "❌ Could not find an available port between 8080 and $MAX_PORT"
        exit 1
    fi
    PORT=$((PORT + 1))
done

echo "✓ Using port: $PORT"
echo "📍 Application URL: http://localhost:$PORT"
echo ""

# Run Flask application
cd "$SCRIPT_DIR"
exec python3 -m flask --app app run --host 0.0.0.0 --port $PORT

