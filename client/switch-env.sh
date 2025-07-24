#!/bin/bash

# Environment switching script for Abe Garage Frontend

echo "🔄 Abe Garage Environment Switcher"
echo ""

if [ "$1" = "dev" ] || [ "$1" = "development" ]; then
    echo "📝 Switching to DEVELOPMENT environment..."
    echo "VITE_API_URL=http://localhost:8080" > .env.local
    echo "VITE_ENV=development" >> .env.local
    echo "VITE_FRONTEND_URL=http://localhost:5173" >> .env.local
    echo "✅ Switched to development environment"
    echo "🌐 API URL: http://localhost:8080"
    echo "🌐 Frontend URL: http://localhost:5173"
elif [ "$1" = "prod" ] || [ "$1" = "production" ]; then
    echo "🚀 Switching to PRODUCTION environment..."
    echo "VITE_API_URL=https://abe-garage-2025-tier-1.onrender.com" > .env.local
    echo "VITE_ENV=production" >> .env.local
    echo "VITE_FRONTEND_URL=http://localhost:5173" >> .env.local
    echo "✅ Switched to production environment"
    echo "🌐 API URL: https://abe-garage-2025-tier-1.onrender.com"
    echo "🌐 Frontend URL: http://localhost:5173"
else
    echo "❌ Invalid environment specified"
    echo ""
    echo "Usage:"
    echo "  ./switch-env.sh dev     - Switch to development"
    echo "  ./switch-env.sh prod    - Switch to production"
    echo ""
    echo "Current environment:"
    if [ -f ".env.local" ]; then
        echo "📄 .env.local file exists"
        cat .env.local
    else
        echo "📄 No .env.local file found (using default)"
    fi
fi 