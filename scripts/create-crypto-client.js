// Script to create OAuth client for Crypto Exchange dashboard

const BASE_URL = 'https://clever-pika-819.convex.site';

async function createClient() {
  const response = await fetch(`${BASE_URL}/api/admin/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_name: 'Crypto Exchange Demo',
      redirect_uris: [
        'http://localhost:3000/auth-agent/callback',
        'https://v0-crypto-exchange-dashboard.vercel.app/auth-agent/callback'
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create client: ${response.status} ${errorText}`);
  }

  return response.json();
}

async function main() {
  try {
    console.log('🌱 Creating OAuth client for Crypto Exchange dashboard...\n');
    
    const client = await createClient();

    console.log('✅ Client created successfully!\n');
    console.log('CLIENT_ID=' + client.client_id);
    console.log('CLIENT_SECRET=' + client.client_secret);
    console.log('\nAdd these to .env.local:\n');
    console.log(`AUTH_AGENT_SERVER_URL=https://clever-pika-819.convex.site`);
    console.log(`AUTH_AGENT_CLIENT_ID=${client.client_id}`);
    console.log(`AUTH_AGENT_CLIENT_SECRET=${client.client_secret}`);
    console.log(`NEXT_PUBLIC_AUTH_AGENT_SERVER_URL=https://clever-pika-819.convex.site`);
    console.log(`NEXT_PUBLIC_AUTH_AGENT_CLIENT_ID=${client.client_id}\n`);
    console.log('⚠️  Save the client_secret securely! It will not be shown again.\n');
    
    // Write to file for easy copy
    const fs = require('fs');
    const envContent = `AUTH_AGENT_SERVER_URL=https://clever-pika-819.convex.site
AUTH_AGENT_CLIENT_ID=${client.client_id}
AUTH_AGENT_CLIENT_SECRET=${client.client_secret}
NEXT_PUBLIC_AUTH_AGENT_SERVER_URL=https://clever-pika-819.convex.site
NEXT_PUBLIC_AUTH_AGENT_CLIENT_ID=${client.client_id}
`;
    fs.writeFileSync('/tmp/crypto-exchange-env.txt', envContent);
    console.log('✅ Saved to /tmp/crypto-exchange-env.txt for easy copy');
  } catch (error) {
    console.error('❌ Error creating client:', error.message);
    process.exit(1);
  }
}

main();

