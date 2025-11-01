// Script to create OAuth client for GitHub clone website

const BASE_URL = 'https://clever-pika-819.convex.site';

async function createClient() {
  const response = await fetch(`${BASE_URL}/api/admin/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_name: 'GitHub Clone Demo',
      redirect_uris: [
        'https://v0-github-clone-with-sign-in.vercel.app/auth-agent/callback',
        'http://localhost:3000/auth-agent/callback'
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
    console.log('🌱 Creating OAuth client for GitHub Clone website...\n');
    
    const client = await createClient();

    console.log('✅ Client created successfully!\n');
    console.log('Add these to your .env.local file in the GitHub clone website:\n');
    console.log(`AUTH_AGENT_SERVER_URL=https://clever-pika-819.convex.site`);
    console.log(`AUTH_AGENT_CLIENT_ID=${client.client_id}`);
    console.log(`AUTH_AGENT_CLIENT_SECRET=${client.client_secret}`);
    console.log(`NEXT_PUBLIC_AUTH_AGENT_SERVER_URL=https://clever-pika-819.convex.site`);
    console.log(`NEXT_PUBLIC_AUTH_AGENT_CLIENT_ID=${client.client_id}\n`);
    console.log('⚠️  Save the client_secret securely! It will not be shown again.\n');
  } catch (error) {
    console.error('❌ Error creating client:', error.message);
    process.exit(1);
  }
}

main();

