#!/bin/bash
# Set master as default branch locally and push

set -e

cd "$(dirname "$0")"

echo "🔍 Checking current branch..."
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "  Current branch: $CURRENT_BRANCH"

echo ""
echo "🌿 Renaming/creating master branch..."
git branch -M master 2>/dev/null || true

echo ""
echo "📤 Pushing master and setting as upstream..."
git push -u origin master --force 2>&1 || {
    echo ""
    echo "⚠️  Force push may have failed. Trying with pull first..."
    git pull origin master --allow-unrelated-histories --no-edit 2>&1 || true
    git push -u origin master 2>&1
}

echo ""
echo "✅ Master branch pushed!"
echo ""
echo "📝 To set master as default on GitHub:"
echo "   1. Go to: https://github.com/hetpatel-11/Auth_Agent/settings/branches"
echo "   2. Under 'Default branch', click the switch/edit icon"
echo "   3. Select 'master' from the dropdown"
echo "   4. Click 'Update' and confirm"
echo ""
echo "   Or use GitHub CLI: gh api repos/hetpatel-11/Auth_Agent -X PATCH -f default_branch=master"


