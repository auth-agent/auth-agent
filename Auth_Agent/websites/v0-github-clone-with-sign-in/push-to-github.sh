#!/bin/bash
set -e

REPO_URL="https://github.com/hetpatel-11/v0-github-clone-with-sign-in.git"
TEMP_DIR="/tmp/v0-github-clone-push"
SOURCE_DIR="/Users/hetpatel/Desktop/Auth_Agent_YC/Auth_Agent/websites/v0-github-clone-with-sign-in"

echo "🧹 Cleaning up..."
rm -rf "$TEMP_DIR"

echo "📦 Cloning repository..."
git clone "$REPO_URL" "$TEMP_DIR"
cd "$TEMP_DIR"

echo "📋 Copying Auth Agent files..."

# Create directories if needed
mkdir -p components lib app/api/auth-agent/exchange app/auth-agent/callback app/dashboard

# Copy files
cp "$SOURCE_DIR/components/signin-form.tsx" components/
cp "$SOURCE_DIR/components/auth-agent-button.tsx" components/
cp "$SOURCE_DIR/lib/auth-agent-sdk.ts" lib/
cp "$SOURCE_DIR/app/api/auth-agent/exchange/route.ts" app/api/auth-agent/exchange/
cp "$SOURCE_DIR/app/auth-agent/callback/page.tsx" app/auth-agent/callback/
cp "$SOURCE_DIR/app/dashboard/page.tsx" app/dashboard/

echo "✅ Files copied"

echo "📝 Staging changes..."
git add -A

echo "💾 Committing..."
git config user.name "hetpatel-11"
git config user.email "hetkp8044@gmail.com"
git commit -m "Add Auth Agent OAuth integration - replace sign-in form with Auth Agent button" || echo "No changes to commit"

echo "🚀 Pushing to GitHub..."
# Try main first, then master
git push origin main 2>&1 || git push origin master 2>&1 || {
    echo "❌ Push failed. Checking branch..."
    BRANCH=$(git branch --show-current)
    echo "Current branch: $BRANCH"
    git push origin "$BRANCH"
}

echo "✅ Done! Changes pushed to GitHub."
echo "Vercel should automatically deploy the changes."


