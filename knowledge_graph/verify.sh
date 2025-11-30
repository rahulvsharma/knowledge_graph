#!/bin/bash

# Verification script - Tests if everything is properly set up

echo "════════════════════════════════════════════════════════════════"
echo "   Knowledge Graph Application - Setup Verification"
echo "════════════════════════════════════════════════════════════════"
echo ""

PASS="✓"
FAIL="✗"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check Python
echo "Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    echo "$PASS Python 3 found: $PYTHON_VERSION"
else
    echo "$FAIL Python 3 not found"
    exit 1
fi

echo ""

# Check directory structure
echo "Checking directory structure..."
REQUIRED_DIRS=(
    "app"
    "app/templates"
    "app/static"
    "app/static/css"
    "app/static/js"
    "data"
    "docs"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$SCRIPT_DIR/$dir" ]; then
        echo "$PASS Directory: $dir"
    else
        echo "$FAIL Directory missing: $dir"
    fi
done

echo ""

# Check files
echo "Checking required files..."
REQUIRED_FILES=(
    "app/__init__.py"
    "app/knowledge_graph.py"
    "app/templates/index.html"
    "app/static/css/style.css"
    "app/static/js/app.js"
    "data/sample_ecommerce.csv"
    "docs/ENHANCEMENT_PLAN.md"
    "requirements.txt"
    "run.sh"
    "README.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$SCRIPT_DIR/$file" ]; then
        echo "$PASS File: $file"
    else
        echo "$FAIL File missing: $file"
    fi
done

echo ""

# Check requirements.txt content
echo "Checking Python dependencies..."
REQUIRED_PACKAGES=("Flask" "NetworkX" "pandas" "flask-cors")

for package in "${REQUIRED_PACKAGES[@]}"; do
    if grep -q "^$package" "$SCRIPT_DIR/requirements.txt"; then
        echo "$PASS Dependency: $package"
    else
        echo "$FAIL Dependency missing: $package"
    fi
done

echo ""

# Check if virtual environment exists
echo "Checking virtual environment..."
if [ -d "$SCRIPT_DIR/venv" ]; then
    echo "$PASS Virtual environment exists"
    
    # Check if Flask is installed
    if "$SCRIPT_DIR/venv/bin/python" -c "import flask" 2>/dev/null; then
        echo "$PASS Flask is installed"
    else
        echo "⚠  Flask not installed - run './run.sh' to install"
    fi
else
    echo "⚠  Virtual environment not created yet - run './run.sh' to create"
fi

echo ""

echo "════════════════════════════════════════════════════════════════"
echo ""
echo "✅ Setup verification complete!"
echo ""
echo "To start the application, run:"
echo "   ./run.sh"
echo ""
echo "════════════════════════════════════════════════════════════════"

