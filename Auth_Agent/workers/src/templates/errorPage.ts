// Error page template

export function errorPage(errorCode: string, message: string): string {
  const escapedMessage = escapeHtml(message);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error - Auth Agent</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      background: #000000;
      min-height: 100vh;
      overflow-x: hidden;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #FF6B35 100%);
      background-size: 400% 400%;
      background-attachment: fixed;
      animation: gradientShift 8s ease infinite;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      width: 100vw;
      color: #fff;
      overflow-x: hidden;
      position: relative;
    }

    body::before {
      content: '';
      position: fixed;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #FF6B35 100%);
      background-size: 400% 400%;
      animation: gradientShift 8s ease infinite;
      z-index: -1;
    }

    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    .container {
      text-align: center;
      max-width: 500px;
      padding: 40px;
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid #FF6B35;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(255, 107, 53, 0.4);
    }

    .brand {
      font-size: 32px;
      font-weight: 700;
      color: #FF6B35;
      margin-bottom: 30px;
      letter-spacing: -0.5px;
    }

    .error-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    h1 {
      font-size: 28px;
      margin-bottom: 15px;
      font-weight: 600;
      color: #FF6B35;
    }

    .error-code {
      font-family: monospace;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 20px;
    }

    p {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.6;
      margin-bottom: 30px;
    }

    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #FF6B35;
      color: #fff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: background 0.3s;
    }

    .button:hover {
      background: #ff8c5a;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">Auth-Agent</div>
    <div class="error-icon">⚠️</div>
    <h1>Authentication Error</h1>
    <div class="error-code">Error: ${escapeHtml(errorCode)}</div>
    <p>${escapedMessage}</p>
    <a href="https://auth-agent.com" class="button">Error</a>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
