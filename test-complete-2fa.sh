#!/bin/bash

SERVER_URL="https://clever-pika-819.convex.site"

echo "🧪 Complete 2FA Test"
echo "============================================================"

# Step 1: Create a new test agent
echo ""
echo "📝 Step 1: Creating new test agent..."
AGENT_RESPONSE=$(curl -s -X POST "$SERVER_URL/api/admin/agents" \
  -H "Content-Type: application/json" \
  -d "{
    \"agent_id\": \"test_2fa_$(date +%s)\",
    \"user_email\": \"owner@example.com\",
    \"user_name\": \"Test Owner\"
  }")

AGENT_ID=$(echo $AGENT_RESPONSE | grep -o '"agent_id":"[^"]*"' | cut -d'"' -f4)
AGENT_SECRET=$(echo $AGENT_RESPONSE | grep -o '"agent_secret":"[^"]*"' | cut -d'"' -f4)

echo "✅ Agent created:"
echo "   Agent ID: $AGENT_ID"
echo "   Agent Secret: $AGENT_SECRET"

# Step 2: Enable 2FA
echo ""
echo "🔐 Step 2: Enabling 2FA for agent..."
ENABLE_2FA_RESPONSE=$(curl -s -X POST "$SERVER_URL/api/admin/agents/enable-2fa" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\": \"$AGENT_ID\"}")

INBOX_EMAIL=$(echo $ENABLE_2FA_RESPONSE | grep -o '"inbox_email":"[^"]*"' | cut -d'"' -f4)

echo "✅ 2FA enabled:"
echo "   Inbox: $INBOX_EMAIL"
echo "$ENABLE_2FA_RESPONSE" | jq '.' 2>/dev/null || echo "$ENABLE_2FA_RESPONSE"

# Step 3: Check 2FA status
echo ""
echo "📊 Step 3: Checking 2FA status..."
curl -s "$SERVER_URL/api/admin/agents/2fa-status?agent_id=$AGENT_ID" | jq '.'

echo ""
echo "============================================================"
echo "✅ 2FA Setup Complete!"
echo ""
echo "📋 Test Details:"
echo "   Agent ID: $AGENT_ID"
echo "   Agent Secret: $AGENT_SECRET"
echo "   AgentMail Inbox: $INBOX_EMAIL"
echo ""
echo "🔑 To test authentication with 2FA:"
echo "   1. Visit an authorization URL (will be generated)"
echo "   2. Agent authenticates with credentials"
echo "   3. Check $INBOX_EMAIL for 2FA code"
echo "   4. Submit code to complete authentication"
