/**
 * AgentMail Integration for 2FA
 *
 * This module handles integration with AgentMail API for sending
 * 2FA verification codes to AI agents.
 */

const AGENTMAIL_API_URL = "https://api.agentmail.to/v0";

export interface AgentMailInbox {
  inbox_id: string;
  email: string;
  created_at: string;
}

export interface SendCodeResult {
  success: boolean;
  message_id?: string;
  error?: string;
}

/**
 * Create a new AgentMail inbox for an agent
 */
export async function createAgentMailInbox(
  agentId: string,
  apiKey: string
): Promise<AgentMailInbox | null> {
  try {
    const response = await fetch(`${AGENTMAIL_API_URL}/inboxes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to create AgentMail inbox:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return null;
    }

    const data = await response.json();
    console.log("AgentMail inbox created:", data);

    return {
      inbox_id: data.inbox_id,
      email: data.inbox_id, // inbox_id is the email address
      created_at: data.created_at,
    };
  } catch (error) {
    console.error("Error creating AgentMail inbox:", error);
    return null;
  }
}

/**
 * Send a 2FA verification code to an agent's inbox
 */
export async function sendVerificationCode(
  inboxEmail: string,
  code: string,
  agentId: string,
  apiKey: string
): Promise<SendCodeResult> {
  try {
    // Use the correct AgentMail API endpoint for sending messages
    // Format: POST /inboxes/{inboxId}/messages/send
    const response = await fetch(`${AGENTMAIL_API_URL}/inboxes/${encodeURIComponent(inboxEmail)}/messages/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        to: inboxEmail,
        subject: "Your 2FA Verification Code",
        text: `Your verification code is: ${code}\n\nThis code will expire in 5 minutes.\n\nIf you did not request this code, please ignore this email.`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .brand {
      font-size: 28px;
      font-weight: 700;
      color: #FF6B35;
      margin-bottom: 10px;
    }
    .code-box {
      background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #FF6B35 100%);
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .code {
      font-size: 48px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
    }
    .info {
      color: #666666;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .warning {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      padding: 15px;
      color: #856404;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      color: #999999;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eeeeee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Auth-Agent</div>
      <p style="color: #666666; margin: 0;">2FA Verification Code</p>
    </div>

    <p class="info">
      Your authentication verification code is:
    </p>

    <div class="code-box">
      <div class="code">${code}</div>
    </div>

    <p class="info">
      <strong>This code will expire in 5 minutes.</strong><br>
      Enter this code to complete your authentication.
    </p>

    <div class="warning">
      If you did not request this code, please ignore this email. Your account security has not been compromised.
    </div>

    <div class="footer">
      Auth-Agent Security System<br>
      Agent ID: ${agentId}
    </div>
  </div>
</body>
</html>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to send verification code:", errorText);
      return {
        success: false,
        error: `Failed to send code: ${errorText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message_id: data.message_id,
    };
  } catch (error: any) {
    console.error("Error sending verification code:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
