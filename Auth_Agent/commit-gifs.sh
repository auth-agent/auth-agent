#!/bin/bash
# Commit GIF files and updated README

set -e

cd "$(dirname "$0")"

echo "📁 Adding GIF files..."
git add demo/gif/*.gif

echo "📝 Adding updated README..."
git add README.md

echo "📊 Files staged:"
git status --short | grep -E "(gif|README)"

echo ""
echo "💾 Committing..."
git commit -m "Add demo GIFs and update README with video demonstrations

- Add Profilio integration demo GIF
- Add Crypto Exchange demo GIF  
- Add GitHub Clone demo GIF
- Update README to display GIFs inline"

echo ""
echo "✅ Committed! Now push with: git push origin master"


