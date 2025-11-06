#!/usr/bin/env python3
"""
Example usage of Auth Agent SDK for AI Agents (Python)

Usage:
    python example.py <authorization_url>

Example:
    python example.py "https://api.auth-agent.com/authorize?client_id=client_xxx&redirect_uri=..."
"""

import sys
import os
import asyncio
from auth_agent_agent_sdk import AuthAgentAgentSDK


async def main():
    # Get authorization URL from command line argument
    if len(sys.argv) < 2:
        print('Usage: python example.py <authorization_url>')
        print('\nExample:')
        print('  python example.py "https://api.auth-agent.com/authorize?client_id=client_xxx&redirect_uri=..."')
        sys.exit(1)

    authorization_url = sys.argv[1]

    # Initialize SDK
    sdk = AuthAgentAgentSDK(
        agent_id=os.getenv('AGENT_ID', 'agent_xxx'),
        agent_secret=os.getenv('AGENT_SECRET', 'your_secret_here'),
        model=os.getenv('AGENT_MODEL', 'gpt-4'),
    )

    print('🤖 Auth Agent SDK Example\n')
    print('=' * 60)
    print(f'Authorization URL: {authorization_url[:80]}...\n')

    try:
        # Method 1: Complete flow (recommended, async)
        print('📋 Starting authentication flow...\n')

        def on_status_update(status):
            print(f'   ⏳ Status: {status.get("status")}')

        result = await sdk.complete_authentication_flow_async(
            authorization_url,
            poll_interval=0.5,
            timeout=60.0,
            on_status_update=on_status_update
        )

        print('\n✅ Authentication successful!')
        code = result.get('code', '')
        print(f'   Authorization Code: {code[:30]}...' if code else '   Authorization Code: (not provided)')
        print(f'   Redirect URI: {result.get("redirect_uri", "N/A")}')
        print(f'   State: {result.get("state", "N/A")}\n')

        print('🎉 Flow completed successfully!')
        print('   The website will now exchange this code for access tokens.\n')

    except TimeoutError:
        print('\n❌ Authentication timeout - exceeded maximum wait time')
        print('   ⚠️  Try again or increase the timeout.\n')
        sys.exit(1)
    except ValueError as e:
        print(f'\n❌ Invalid input: {e}')
        sys.exit(1)
    except Exception as e:
        print(f'\n❌ Authentication failed: {e}')
        print('   ⚠️  Check your credentials and authorization URL.\n')
        sys.exit(1)


if __name__ == '__main__':
    asyncio.run(main())

