#!/usr/bin/env python3
"""
Script to generate new agent credentials.
Run this and update your .env file (lines 2-5) with the output.
"""

import urllib.request
import urllib.parse
import json
import random
import string
import sys

API_URL = "https://clever-pika-819.convex.site/api/admin/agents"

def create_agent():
    """Create a new agent and return credentials."""
    # Generate a unique agent ID
    agent_id = f"browser_use_{''.join(random.choices(string.ascii_lowercase + string.digits, k=16))}"
    
    data = json.dumps({
        "agent_id": agent_id,
        "user_email": "browser-use-test@example.com",
        "user_name": "Browser Use Test Agent"
    }).encode()
    
    req = urllib.request.Request(
        API_URL,
        data=data,
        headers={"Content-Type": "application/json"}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status != 201:
                print(f"Error: HTTP {response.status}", file=sys.stderr)
                print(response.read().decode(), file=sys.stderr)
                sys.exit(1)
            
            result = json.loads(response.read().decode())
            return result.get('agent_id'), result.get('agent_secret')
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"HTTP Error {e.code}: {error_body}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    print("Creating new agent...", file=sys.stderr)
    agent_id, agent_secret = create_agent()
    
    print("\n# Update these lines in your .env file (lines 2-5):")
    print(f"AGENT_ID={agent_id}")
    print(f"AGENT_SECRET={agent_secret}")
    print(f"AGENT_MODEL=browser-use")
    print(f"BROWSER_USE_API_KEY=your-browser-use-api-key")

