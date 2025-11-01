/**
 * Test sending a 2FA code via AgentMail
 */

const SERVER_URL = "https://clever-pika-819.convex.site";
const TEST_AGENT_ID = "test_agent_1762014948280";
const TEST_INBOX = "magnificentwine278@agentmail.to";

async function testSendCode() {
  console.log("🧪 Testing 2FA Code Send");
  console.log("=".repeat(60));

  // Step 1: Create a dummy auth request to generate a code
  console.log("\n📝 Creating authorization request...");

  const authUrl = `${SERVER_URL}/authorize?` + new URLSearchParams({
    client_id: "client_profilio_2024",
    redirect_uri: "http://localhost:3000/ai-auth/callback",
    response_type: "code",
    state: "test_state_" + Date.now(),
    code_challenge: "test_challenge",
    code_challenge_method: "S256",
    scope: "read write",
  }).toString();

  const authResponse = await fetch(authUrl);
  const authHtml = await authResponse.text();

  // Extract request_id
  const requestIdMatch = authHtml.match(/request_id:\s*['"]([^'"]+)['"]/);
  if (!requestIdMatch) {
    console.error("❌ Could not extract request_id from auth page");
    return;
  }

  const requestId = requestIdMatch[1];
  console.log(`✅ Request ID: ${requestId}`);

  // Step 2: Authenticate with 2FA enabled agent
  console.log("\n🔐 Authenticating agent (should trigger 2FA code send)...");

  const authResult = await fetch(`${SERVER_URL}/api/agent/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      request_id: requestId,
      agent_id: TEST_AGENT_ID,
      agent_secret: "nrUeSesA8V1o7vsoYl1v0p63ZXtqIf_Pone-DWmDMVA", // From previous test
      model: "claude-3-5-sonnet-20241022",
    }),
  });

  const authData = await authResult.json();

  console.log("\n📧 Authentication Response:");
  console.log(JSON.stringify(authData, null, 2));

  if (authData.requires_2fa) {
    console.log("\n✅ 2FA Code should have been sent!");
    console.log(`   Check inbox: ${TEST_INBOX}`);
    console.log(`   Code expires in: ${authData.expires_in} seconds`);
    console.log("\n📖 To retrieve the code:");
    console.log(`   Visit: https://console.agentmail.to`);
    console.log(`   Or use AgentMail API to read messages from: ${TEST_INBOX}`);
  } else if (authData.success) {
    console.log("\n⚠️ Authentication succeeded without 2FA (2FA might not be enabled)");
  } else {
    console.log("\n❌ Authentication failed:", authData);
  }
}

testSendCode().catch(console.error);
