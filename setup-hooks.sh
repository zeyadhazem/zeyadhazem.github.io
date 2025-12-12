#!/bin/bash

# Setup script for git hooks
# This script copies the pre-push hook to the .git/hooks directory and makes it executable

echo "🔧 Setting up git hooks..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository. Please run this script from the root of your git repository."
    exit 1
fi

# Check if hooks directory exists
if [ ! -d "hooks" ]; then
    echo "❌ Error: hooks directory not found. Please make sure you're in the correct repository."
    exit 1
fi

# Copy pre-push hook
if [ -f "hooks/pre-push" ]; then
    cp hooks/pre-push .git/hooks/pre-push
    chmod +x .git/hooks/pre-push
    echo "✅ Pre-push hook installed successfully!"
    echo "🚀 The hook will now automatically run npm run deploy when you push to master/main branch."
else
    echo "❌ Error: hooks/pre-push file not found."
    exit 1
fi

echo "🎉 Git hooks setup complete!"