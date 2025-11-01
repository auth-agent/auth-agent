#!/bin/bash
# Push Auth Agent to GitHub

set -e

echo "📂 Navigating to Auth_Agent directory..."
cd "$(dirname "$0")"
pwd

echo ""
echo "🔍 Checking git status..."
if [ ! -d .git ]; then
    echo "  ⚠️  Git repo not initialized. Initializing..."
    git init
fi

echo ""
echo "🔗 Setting up remote..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/hetpatel-11/Auth_Agent.git
git remote -v

echo ""
echo "📦 Staging all files..."
git add -A

echo ""
echo "📊 Files to commit:"
git status --short | head -10

echo ""
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
- Production-ready serverless deployment on Convex" || echo "  ⚠️  Nothing to commit (already up to date or no changes)"

echo ""
echo "🌿 Creating/switching to master branch..."
git branch -M master 2>/dev/null || true

echo ""
echo "🚀 Pushing to GitHub (master branch)..."
git push -u origin master || {
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "   1. Authentication required - you may need to:"
    echo "      - Set up SSH keys, or"
    echo "      - Use GitHub CLI: gh auth login, or"
    echo "      - Use personal access token in URL"
    echo "   2. Remote repository doesn't exist yet"
    echo ""
    echo "   Try: git push -u origin master"
    exit 1
}

echo ""
echo "✅ Successfully pushed to https://github.com/hetpatel-11/Auth_Agent.git"

