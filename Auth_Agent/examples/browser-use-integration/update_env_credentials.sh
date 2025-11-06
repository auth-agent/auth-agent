#!/bin/bash
# Script to create new agent credentials and update .env file

set -e

API_URL="https://clever-pika-819.convex.site/api/admin/agents"

# Generate random agent ID
AGENT_ID="browser_use_$(openssl rand -hex 8)"

echo "Creating new agent with ID: $AGENT_ID"
echo ""

# Create agent
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"agent_id\": \"$AGENT_ID\",
    \"user_email\": \"browser-use-test@example.com\",
    \"user_name\": \"Browser Use Test Agent\"
  }")

# Extract credentials from response
NEW_AGENT_ID=$(echo "$RESPONSE" | grep -o '"agent_id":"[^"]*"' | cut -d'"' -f4)
NEW_AGENT_SECRET=$(echo "$RESPONSE" | grep -o '"agent_secret":"[^"]*"' | cut -d'"' -f4)

if [ -z "$NEW_AGENT_ID" ] || [ -z "$NEW_AGENT_SECRET" ]; then
  echo "Error: Failed to create agent"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "✅ Agent created successfully!"
echo ""
echo "New credentials:"
echo "AGENT_ID=$NEW_AGENT_ID"
echo "AGENT_SECRET=$NEW_AGENT_SECRET"
echo ""
echo "Update your .env file with these values (lines 2-5)."


