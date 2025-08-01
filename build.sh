#!/bin/bash
echo "🏗️  Pre-build verification..."

# Check Node.js version
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install dependencies
echo "Installing dependencies..."
npm ci --only=production

# Build the application
echo "Building application..."
npm run build

echo "✅ Build completed successfully!"