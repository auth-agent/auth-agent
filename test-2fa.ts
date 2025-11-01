/**
 * Test script for 2FA implementation
 *
 * This script will:
 * 1. Create a test agent
 * 2. Enable 2FA for the agent
 * 3. Simulate authentication with 2FA
 */

const SERVER_URL = "https://clever-pika-819.convex.site";

interface AgentResponse {
  agent_id: string;
  agent_secret: string;
  user_email: string;
  user_name: string;
}

interface TwoFactorResponse {
  success: boolean;
  inbox_email?: string;
  message?: string;
  error?: string;
}

async function createTestAgent(): Promise<AgentResponse> {
  console.log("\n🔧 Creating test agent...");

  const response = await fetch(`${SERVER_URL}/api/admin/agents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agent_id: `test_agent_${Date.now()}`,
      user_email: "test@example.com",
      user_name: "Test User",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create agent: ${JSON.stringify(error)}`);
  }

  const agent = await response.json();
  console.log("✅ Agent created:");
  console.log(`   Agent ID: ${agent.agent_id}`);
  console.log(`   Agent Secret: ${agent.agent_secret}`);
  console.log(`   User Email: ${agent.user_email}`);
  console.log(`   User Name: ${agent.user_name}`);

  return agent;
}

async function enableTwoFactor(agentId: string): Promise<TwoFactorResponse> {
  console.log("\n🔐 Enabling 2FA...");

  const response = await fetch(`${SERVER_URL}/api/admin/agents/enable-2fa`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agent_id: agentId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to enable 2FA: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  console.log("✅ 2FA enabled:");
  console.log(`   Inbox Email: ${result.inbox_email}`);
  console.log(`   Message: ${result.message}`);

  return result;
}

async function checkTwoFactorStatus(agentId: string): Promise<any> {
  console.log("\n📊 Checking 2FA status...");

  const response = await fetch(`${SERVER_URL}/api/admin/agents/2fa-status?agent_id=${agentId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to check 2FA status: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  console.log("✅ 2FA Status:");
  console.log(`   Enabled: ${result.enabled}`);
  console.log(`   Inbox Email: ${result.inbox_email}`);

  return result;
}

async function testAuthentication(agent: AgentResponse, clientId: string, redirectUri: string): Promise<void> {
  console.log("\n🔑 Testing authentication flow with 2FA...");

  // Step 1: Create authorization request
  console.log("\n📝 Step 1: Creating authorization request...");
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateRandomString(32);

  const authUrl = `${SERVER_URL}/authorize?` + new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    scope: "read write",
  }).toString();

  console.log(`   Authorization URL: ${authUrl}`);

  const authResponse = await fetch(authUrl);
  const authHtml = await authResponse.text();

  // Extract request_id from the HTML
  const requestIdMatch = authHtml.match(/request_id:\s*'([^']+)'/);
  if (!requestIdMatch) {
    throw new Error("Failed to extract request_id from authorization page");
  }

  const requestId = requestIdMatch[1];
  console.log(`   Request ID: ${requestId}`);

  // Step 2: Agent authenticates (should trigger 2FA)
  console.log("\n🤖 Step 2: Agent authenticating (should trigger 2FA code send)...");
  const authResult = await fetch(`${SERVER_URL}/api/agent/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      request_id: requestId,
      agent_id: agent.agent_id,
      agent_secret: agent.agent_secret,
      model: "claude-3-5-sonnet-20241022",
    }),
  });

  const authData = await authResult.json();
  console.log("✅ Authentication response:");
  console.log(JSON.stringify(authData, null, 2));

  if (authData.requires_2fa) {
    console.log("\n📧 2FA code sent! Check the AgentMail inbox.");
    console.log("   You'll need to retrieve the code from the inbox and verify it.");
    console.log(`   Request ID: ${requestId}`);
    console.log(`   Expires in: ${authData.expires_in} seconds`);

    // Instructions for manual verification
    console.log("\n📋 To complete authentication:");
    console.log("   1. Check the AgentMail inbox for the verification code");
    console.log("   2. Use the code to verify:");
    console.log(`
   curl -X POST ${SERVER_URL}/api/agent/verify-2fa \\
     -H "Content-Type: application/json" \\
     -d '{
       "request_id": "${requestId}",
       "code": "YOUR_CODE_HERE",
       "model": "claude-3-5-sonnet-20241022"
     }'
    `);
  } else if (authData.success) {
    console.log("✅ Authentication successful without 2FA (unexpected!)");
  } else {
    console.log("❌ Authentication failed:", authData);
  }
}

// Helper functions for PKCE
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

function base64UrlEncode(array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...array));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

// Main test flow
async function main() {
  try {
    console.log("🧪 Starting 2FA Test Suite");
    console.log("=" .repeat(60));

    // Step 1: Create test agent
    const agent = await createTestAgent();

    // Step 2: Enable 2FA
    const twoFactorResult = await enableTwoFactor(agent.agent_id);

    // Step 3: Check 2FA status
    await checkTwoFactorStatus(agent.agent_id);

    // Step 4: Test authentication
    const CLIENT_ID = "client_profilio_2024";
    const REDIRECT_URI = "http://localhost:3000/ai-auth/callback";

    await testAuthentication(agent, CLIENT_ID, REDIRECT_URI);

    console.log("\n" + "=".repeat(60));
    console.log("✅ Test suite completed!");
    console.log("\n💡 Agent details for future reference:");
    console.log(`   Agent ID: ${agent.agent_id}`);
    console.log(`   AgentMail Inbox: ${twoFactorResult.inbox_email}`);

  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

main();
