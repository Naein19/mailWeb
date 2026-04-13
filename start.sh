#!/bin/bash

# Email Clustering Dashboard - Quick Start Script

echo "🚀 Email Clustering Dashboard - Quick Start"
echo "==========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Navigate to project directory
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_DIR"

echo "📁 Project directory: $PROJECT_DIR"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies... (this may take a few minutes)"
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Installation failed"
        exit 1
    fi
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🎨 Starting development server..."
echo "📍 Application will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "==========================================="
echo ""

# Start the development server
npm run dev
