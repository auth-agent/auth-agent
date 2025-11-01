// Script to create new agent credentials via Convex API

const BASE_URL = 'https://clever-pika-819.convex.site';

async function createAgent() {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 10);
  const agent_id = `browser_use_${timestamp}_${randomId}`;

  const response = await fetch(`${BASE_URL}/api/admin/agents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      agent_id: agent_id,
      user_email: 'browser-use-test@example.com',
      user_name: 'Browser Use Test Agent',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create agent: ${response.status} ${errorText}`);
  }

  return response.json();
}

async function main() {
  try {
    console.log('🌱 Creating new agent credentials...\n');
    
    const agent = await createAgent();

    console.log('✅ Agent created successfully!\n');
    console.log('Add these to your .env file (lines 2-5):\n');
    console.log(`AGENT_ID=${agent.agent_id}`);
    console.log(`AGENT_SECRET=${agent.agent_secret}`);
    console.log(`AGENT_MODEL=browser-use`);
    console.log(`BROWSER_USE_API_KEY=your-browser-use-api-key\n`);
    console.log('⚠️  Save the agent_secret securely! It will not be shown again.\n');
  } catch (error) {
    console.error('❌ Error creating agent:', error.message);
    process.exit(1);
  }
}

main();

