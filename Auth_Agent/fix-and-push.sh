#!/bin/bash
# Fix git conflicts and push to GitHub

set -e

echo "📂 Navigating to Auth_Agent directory..."
cd "$(dirname "$0")"
pwd

echo ""
echo "🔍 Checking git status..."
git status

echo ""
echo "📥 Fetching from remote..."
git fetch origin

echo ""
echo "🔄 Pulling remote changes (allowing unrelated histories)..."
# Try to pull with merge strategy
if ! git pull origin master --allow-unrelated-histories --no-edit 2>&1; then
    echo ""
    echo "⚠️  Merge conflict or pull failed. Options:"
    echo ""
    echo "Option 1: Force push (OVERWRITES remote changes)"
    echo "  This will replace everything on GitHub with your local code."
    read -p "Force push? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Force pushing to master..."
        git push -u origin master --force
        echo "✅ Force push complete!"
        exit 0
    fi
fi

echo ""
echo "📦 Staging all files..."
git add -A

echo ""
echo "📊 Files to commit:"
git status --short | head -10

echo ""
if git diff --staged --quiet; then
    echo "⚠️  No changes to commit (already committed or nothing changed)"
else
    echo "💾 Committing..."
    git commit -m "feat: Complete Auth Agent OAuth 2.1 implementation

- Full OAuth 2.1 compliant authorization server on Convex
- TypeScript and Python SDKs for AI agents
- React SDK components for client websites
- Browser-use integration examples
- Three demo websites with Auth Agent sign-in
- Comprehensive documentation and hackathon pitch guide
- Environment variable examples (.env.example) for all components
- Updated .gitignore to ignore all .env* files (security)
- Production-ready serverless deployment on Convex"
fi

echo ""
echo "🚀 Pushing to GitHub (master branch)..."
git push -u origin master

echo ""
echo "✅ Successfully pushed to https://github.com/hetpatel-11/Auth_Agent.git"


