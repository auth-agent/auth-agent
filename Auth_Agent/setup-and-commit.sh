#!/bin/bash
# Setup environment variable examples and commit everything to GitHub

set -e

echo "📦 Setting up .env.example files..."

# Root .env.example
cat > .env.example << 'EOF'
# Auth Agent Server Configuration
# Copy this file to .env and fill in your values

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_ISSUER=auth-agent.com

# Convex Configuration
# Set this to your Convex site URL (e.g., https://your-project.convex.site)
# In production, Convex automatically serves via HTTPS
CONVEX_SITE_URL=https://clever-pika-819.convex.site

# Optional: AgentMail API Key (for 2FA)
# AGENTMAIL_API_KEY=your-agentmail-api-key
EOF
echo "  ✓ Created .env.example"

# Browser-use integration example
mkdir -p examples/browser-use-integration
cat > examples/browser-use-integration/.env.example << 'EOF'
# Auth Agent AI Agent Credentials
# Copy this file to .env and fill in your agent credentials
# Create an agent using: python3 create_new_agent.py or scripts/create-agent-credentials.js

AGENT_ID=your_agent_id_here
AGENT_SECRET=your_agent_secret_here
AGENT_MODEL=browser-use

# Browser-Use API Key (optional, if using ChatBrowserUse)
# Get your API key at: https://cloud.browser-use.com/new-api-key
BROWSER_USE_API_KEY=your_browser_use_api_key

# Alternative LLM API Keys (if not using ChatBrowserUse)
# OPENAI_API_KEY=your_openai_api_key
# ANTHROPIC_API_KEY=your_anthropic_api_key
EOF
echo "  ✓ Created examples/browser-use-integration/.env.example"

# GitHub Clone website
mkdir -p websites/v0-github-clone-with-sign-in
cat > websites/v0-github-clone-with-sign-in/.env.example << 'EOF'
# Auth Agent Client Credentials for GitHub Clone Demo
# Copy this file to .env.local for Next.js

# Auth Agent Server URL
AUTH_AGENT_SERVER_URL=https://clever-pika-819.convex.site

# OAuth Client Credentials
# Create a client using: scripts/create-github-clone-client.js
AUTH_AGENT_CLIENT_ID=your_client_id_here
AUTH_AGENT_CLIENT_SECRET=your_client_secret_here

# Public environment variables (for client-side SDK)
NEXT_PUBLIC_AUTH_AGENT_SERVER_URL=https://clever-pika-819.convex.site
NEXT_PUBLIC_AUTH_AGENT_CLIENT_ID=your_client_id_here
EOF
echo "  ✓ Created websites/v0-github-clone-with-sign-in/.env.example"

# Crypto Exchange website
mkdir -p websites/v0-crypto-exchange-dashboard
cat > websites/v0-crypto-exchange-dashboard/.env.example << 'EOF'
# Auth Agent Client Credentials for Crypto Exchange Demo
# Copy this file to .env.local for Next.js

# Auth Agent Server URL
AUTH_AGENT_SERVER_URL=https://clever-pika-819.convex.site

# OAuth Client Credentials
# Create a client using: scripts/create-crypto-client.js
AUTH_AGENT_CLIENT_ID=your_client_id_here
AUTH_AGENT_CLIENT_SECRET=your_client_secret_here

# Public environment variables (for client-side SDK)
NEXT_PUBLIC_AUTH_AGENT_SERVER_URL=https://clever-pika-819.convex.site
NEXT_PUBLIC_AUTH_AGENT_CLIENT_ID=your_client_id_here
EOF
echo "  ✓ Created websites/v0-crypto-exchange-dashboard/.env.example"

# E-commerce website
mkdir -p websites/v0-e-commerce-website
cat > websites/v0-e-commerce-website/.env.example << 'EOF'
# Auth Agent Client Credentials for E-commerce Demo
# Copy this file to .env.local for Next.js

# Auth Agent Server URL
AUTH_AGENT_SERVER_URL=https://clever-pika-819.convex.site

# OAuth Client Credentials
# Create a client using: scripts/create-ecommerce-client.py
AUTH_AGENT_CLIENT_ID=your_client_id_here
AUTH_AGENT_CLIENT_SECRET=your_client_secret_here

# Public environment variables (for client-side SDK)
NEXT_PUBLIC_AUTH_AGENT_SERVER_URL=https://clever-pika-819.convex.site
NEXT_PUBLIC_AUTH_AGENT_CLIENT_ID=your_client_id_here
EOF
echo "  ✓ Created websites/v0-e-commerce-website/.env.example"

echo ""
echo "🔍 Checking git status..."
if [ ! -d .git ]; then
    echo "  Initializing git repository..."
    git init
fi

# Set remote
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/hetpatel-11/Auth_Agent.git 2>/dev/null || git remote set-url origin https://github.com/hetpatel-11/Auth_Agent.git

echo ""
echo "📝 Staging all files..."
git add -A

echo ""
echo "📊 Files to be committed:"
git status --short | head -20

echo ""
echo "💾 Committing..."
git commit -m "feat: Complete Auth Agent OAuth 2.1 implementation

- Full OAuth 2.1 compliant authorization server on Convex
- TypeScript and Python SDKs for AI agents
- React SDK components for client websites
- Browser-use integration examples
- Three demo websites with Auth Agent sign-in (GitHub clone, Crypto exchange, E-commerce)
- Comprehensive documentation and hackathon pitch guide
- Environment variable examples (.env.example) for all components
- Production-ready serverless deployment on Convex"

echo ""
echo "🚀 Pushing to GitHub..."
git branch -M main 2>/dev/null || true
git push -u origin main 2>&1 || git push -u origin master 2>&1

echo ""
echo "✅ Done! All files committed and pushed to https://github.com/hetpatel-11/Auth_Agent.git"


