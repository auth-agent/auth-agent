/**
 * Example usage of Auth Agent SDK for AI Agents (TypeScript)
 * 
 * Run with: npx ts-node example.ts <authorization_url>
 */

import { AuthAgentAgentSDK } from './auth-agent-agent-sdk';

async function main() {
  // Get authorization URL from command line argument
  const authorizationUrl = process.argv[2];

  if (!authorizationUrl) {
    console.error('Usage: ts-node example.ts <authorization_url>');
    console.error('\nExample:');
    console.error('  ts-node example.ts "https://clever-pika-819.convex.site/authorize?client_id=client_xxx&redirect_uri=..."');
    process.exit(1);
  }

  // Initialize SDK
  const sdk = new AuthAgentAgentSDK({
    agentId: process.env.AGENT_ID || 'agent_xxx',
    agentSecret: process.env.AGENT_SECRET || 'your_secret_here',
    model: process.env.AGENT_MODEL || 'gpt-4',
  });

  console.log('🤖 Auth Agent SDK Example\n');
  console.log('=' .repeat(60));
  console.log(`Authorization URL: ${authorizationUrl.substring(0, 80)}...\n`);

  try {
    // Method 1: Complete flow (recommended)
    console.log('📋 Starting authentication flow...\n');

    const result = await sdk.completeAuthenticationFlow(authorizationUrl, {
      pollInterval: 500,
      timeout: 60000,
      onStatusUpdate: (status) => {
        console.log(`   ⏳ Status: ${status.status}`);
      }
    });

    console.log('\n✅ Authentication successful!');
    console.log(`   Authorization Code: ${result.code?.substring(0, 30)}...`);
    console.log(`   Redirect URI: ${result.redirect_uri}`);
    console.log(`   State: ${result.state}\n`);

    console.log('🎉 Flow completed successfully!');
    console.log('   The website will now exchange this code for access tokens.\n');

  } catch (error) {
    console.error('\n❌ Authentication failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        console.error('   ⚠️  Authentication took too long. Try again.');
      } else if (error.message.includes('Could not extract request_id')) {
        console.error('   ⚠️  Invalid authorization page. Check the URL.');
      } else {
        console.error('   ⚠️  Error:', error.message);
      }
    }
    
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

