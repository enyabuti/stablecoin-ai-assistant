#!/bin/bash

echo "🚀 Setting up Stablecoin AI Assistant on GitHub..."

# Repository details
REPO_NAME="stablecoin-ai-assistant"
REPO_DESCRIPTION="AI-powered stablecoin automation with Circle integration, cross-chain routing, and natural language rule creation"

echo "Repository name: $REPO_NAME"
echo "Description: $REPO_DESCRIPTION"

# Method 1: Using GitHub CLI (if authenticated)
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    echo "✅ GitHub CLI is authenticated"
    echo "Creating repository with GitHub CLI..."
    
    gh repo create "$REPO_NAME" \
        --description "$REPO_DESCRIPTION" \
        --public \
        --clone=false \
        --push=false
    
    # Add remote and push
    git remote add origin "https://github.com/$(gh api user --jq .login)/$REPO_NAME.git"
    git branch -M main
    git push -u origin main
    
    echo "✅ Repository created and code pushed!"
    echo "🌐 Your repository: https://github.com/$(gh api user --jq .login)/$REPO_NAME"
    
else
    echo "❌ GitHub CLI not authenticated or not available"
    echo ""
    echo "🔧 Manual Setup Instructions:"
    echo "1. Go to https://github.com/new"
    echo "2. Repository name: $REPO_NAME"
    echo "3. Description: $REPO_DESCRIPTION"
    echo "4. Make it Public"
    echo "5. DO NOT initialize with README (we already have files)"
    echo "6. Click 'Create repository'"
    echo ""
    echo "Then run these commands:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/$REPO_NAME.git"
    echo "git branch -M main"  
    echo "git push -u origin main"
fi