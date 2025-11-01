#!/usr/bin/env python3
"""Create OAuth client for Crypto Exchange dashboard"""

import requests
import json

BASE_URL = 'https://clever-pika-819.convex.site'

response = requests.post(
    f'{BASE_URL}/api/admin/clients',
    json={
        'client_name': 'Crypto Exchange Demo',
        'redirect_uris': [
            'http://localhost:3000/auth-agent/callback',
            'https://v0-crypto-exchange-dashboard.vercel.app/auth-agent/callback'
        ],
    }
)

if response.status_code != 201:
    print(f'Error: {response.status_code}')
    print(response.text)
    exit(1)

client = response.json()

print('✅ Client created successfully!\n')
print('CLIENT_ID=' + client['client_id'])
print('CLIENT_SECRET=' + client['client_secret'])
print('\nAdd these to .env.local:\n')
print(f"AUTH_AGENT_SERVER_URL=https://clever-pika-819.convex.site")
print(f"AUTH_AGENT_CLIENT_ID={client['client_id']}")
print(f"AUTH_AGENT_CLIENT_SECRET={client['client_secret']}")
print(f"NEXT_PUBLIC_AUTH_AGENT_SERVER_URL=https://clever-pika-819.convex.site")
print(f"NEXT_PUBLIC_AUTH_AGENT_CLIENT_ID={client['client_id']}\n")
print('⚠️  Save the client_secret securely!\n')

# Save to file
with open('/tmp/crypto-exchange-env.txt', 'w') as f:
    f.write(f"""AUTH_AGENT_SERVER_URL=https://clever-pika-819.convex.site
AUTH_AGENT_CLIENT_ID={client['client_id']}
AUTH_AGENT_CLIENT_SECRET={client['client_secret']}
NEXT_PUBLIC_AUTH_AGENT_SERVER_URL=https://clever-pika-819.convex.site
NEXT_PUBLIC_AUTH_AGENT_CLIENT_ID={client['client_id']}
""")
print('✅ Saved to /tmp/crypto-exchange-env.txt')

