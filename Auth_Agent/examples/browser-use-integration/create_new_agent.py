#!/usr/bin/env python3
"""Create a new agent and output credentials for .env file."""

import requests
import json
import random
import string
import sys

def create_agent():
    """Create a new agent and return credentials."""
    # Generate a unique agent ID
    agent_id = f"browser_use_{''.join(random.choices(string.ascii_lowercase + string.digits, k=16))}"
    
    response = requests.post(
        "https://api.auth-agent.com/api/admin/agents",
        json={
            "agent_id": agent_id,
            "user_email": "browser-use-test@example.com",
            "user_name": "Browser Use Test Agent"
        },
        timeout=10
    )
    
    if response.status_code != 201:
        print(f"Error: {response.status_code}", file=sys.stderr)
        print(response.text, file=sys.stderr)
        sys.exit(1)
    
    data = response.json()
    return data.get('agent_id'), data.get('agent_secret')

if __name__ == "__main__":
    try:
        agent_id, agent_secret = create_agent()
        print(f"AGENT_ID={agent_id}")
        print(f"AGENT_SECRET={agent_secret}")
        print(f"AGENT_MODEL=browser-use")
        print(f"BROWSER_USE_API_KEY=your-browser-use-api-key")
    except Exception as e:
        print(f"Error creating agent: {e}", file=sys.stderr)
        sys.exit(1)


