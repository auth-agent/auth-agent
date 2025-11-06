#!/bin/bash
# Script to push Auth Agent changes to GitHub repo

REPO_URL="https://github.com/hetpatel-11/v0-github-clone-with-sign-in.git"
TEMP_DIR="/tmp/github-clone-repo"
SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "📦 Cloning repository..."
cd /tmp
rm -rf github-clone-repo
git clone $REPO_URL github-clone-repo
cd github-clone-repo

echo "📋 Copying Auth Agent files..."
# Copy the updated files
cp "$SOURCE_DIR/components/signin-form.tsx" "$TEMP_DIR/components/signin-form.tsx"
cp "$SOURCE_DIR/components/auth-agent-button.tsx" "$TEMP_DIR/components/auth-agent-button.tsx"
cp "$SOURCE_DIR/lib/auth-agent-sdk.ts" "$TEMP_DIR/lib/auth-agent-sdk.ts"
cp "$SOURCE_DIR/app/api/auth-agent/exchange/route.ts" "$TEMP_DIR/app/api/auth-agent/exchange/route.ts"
cp "$SOURCE_DIR/app/auth-agent/callback/page.tsx" "$TEMP_DIR/app/auth-agent/callback/page.tsx"
cp "$SOURCE_DIR/app/dashboard/page.tsx" "$TEMP_DIR/app/dashboard/page.tsx"

# Create directories if they don't exist
mkdir -p "$TEMP_DIR/lib"
mkdir -p "$TEMP_DIR/app/api/auth-agent/exchange"
mkdir -p "$TEMP_DIR/app/auth-agent/callback"

echo "✅ Files copied. Ready to commit and push."
echo ""
echo "Next steps:"
echo "1. cd $TEMP_DIR"
echo "2. git add -A"
echo "3. git commit -m 'Add Auth Agent OAuth integration'"
echo "4. git push"


