#!/bin/bash

echo "Building for Cloudflare Pages..."

# Install dependencies
npm install

# Build with Vite
npm run build

# Verify dist folder exists
if [ -d "dist" ]; then
    echo "Build successful! Output in ./dist"

    # List files in dist
    echo "Files in dist:"
    ls -la dist/

    # Ensure all public assets are copied
    if [ -d "public" ]; then
        echo "Copying public assets..."
        cp -r public/* dist/ 2>/dev/null || true
    fi

    echo "Build complete! Ready for Cloudflare Pages."
else
    echo "Error: dist folder not found"
    exit 1
fi
