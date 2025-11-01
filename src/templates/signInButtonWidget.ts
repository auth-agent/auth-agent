// Script template that renders the branded Auth Agent sign-in button.
// This mirrors how providers like Google ship immutable sign-in buttons.

import { CONFIG } from '../lib/constants.js';

/**
 * Returns the JavaScript that renders an Auth Agent sign-in button.
 * Consumers include it via:
 *
 * <div id="auth-agent-button"></div>
 * <script
 *   src="https://auth-agent.com/widget/signin-button.js"
 *   data-client-id="client_123"
 *   data-redirect-uri="https://example.com/callback"
 *   data-server-url="https://auth-agent.com"
 * ></script>
 *
 * The script registers a <auth-agent-signin> custom element with a closed
 * shadow root so the label/icon cannot be altered without replacing the
 * entire widget.
 */
export function signInButtonWidgetScript(): string {
  const defaultServerUrl = JSON.stringify(CONFIG.BASE_URL);

  return `(() => {
  const DEFAULT_SERVER_URL = ${defaultServerUrl};
  const BUTTON_LABEL = 'Sign in with Auth Agent';
  const STORAGE_PREFIX = 'auth-agent';

  const BUTTON_STYLE = \`
    :host {
      display: inline-block;
    }

    button {
      all: unset;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-family: "Roboto", "Helvetica Neue", Arial, sans-serif;
      font-size: 15px;
      font-weight: 600;
      color: #1f1f1f;
      background: #fff;
      border-radius: 22px;
      padding: 12px 20px;
      min-width: 220px;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
      transition: box-shadow 0.2s ease, transform 0.2s ease;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }

    button:hover:not([disabled]) {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transform: translateY(-1px);
    }

    button:focus-visible {
      outline: 3px solid #f97316;
      outline-offset: 2px;
    }

    button[disabled] {
      cursor: progress;
      opacity: 0.75;
    }

    .icon {
      display: inline-flex;
      width: 20px;
      height: 20px;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f97316 0%, #111827 100%);
      border-radius: 50%;
      color: #fff;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }

    .label {
      white-space: nowrap;
    }
  \`;

  function generateRandomString(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    let result = '';
    for (let i = 0; i < randomValues.length; i++) {
      result += charset[randomValues[i] % charset.length];
    }
    return result;
  }

  async function sha256Base64Url(value) {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const byteArray = new Uint8Array(hash);
    let binary = '';
    for (let i = 0; i < byteArray.byteLength; i++) {
      binary += String.fromCharCode(byteArray[i]);
    }
    return btoa(binary).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+/g, '');
  }

  class AuthAgentSignInButton extends HTMLElement {
    constructor() {
      super();
      this._initialized = false;
      this._shadow = null;
      this._button = null;
    }

    connectedCallback() {
      if (this._initialized) return;
      this._initialized = true;

      const shadow = this.attachShadow({ mode: 'closed' });
      const style = document.createElement('style');
      style.textContent = BUTTON_STYLE;

      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', BUTTON_LABEL);

      const icon = document.createElement('span');
      icon.className = 'icon';
      icon.textContent = 'AA';

      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = BUTTON_LABEL;

      button.appendChild(icon);
      button.appendChild(label);

      button.addEventListener('click', () => {
        this.startAuth(button).catch((error) => {
          console.error('Auth Agent sign-in failed:', error);
          button.disabled = false;
        });
      });

      const container = document.createElement('slot');
      shadow.appendChild(style);
      shadow.appendChild(button);
      shadow.appendChild(container);

      this._shadow = shadow;
      this._button = button;
    }

    async startAuth(button) {
      if (button.disabled) return;
      button.disabled = true;

      const clientId = this.getAttribute('client-id');
      if (!clientId) {
        throw new Error('Missing client-id attribute on <auth-agent-signin>');
      }

      const redirectUri = this.getAttribute('redirect-uri') || (window.location.origin + '/callback');
      const scope = this.getAttribute('scope') || 'openid profile';
      const serverUrl = this.getAttribute('server-url') || DEFAULT_SERVER_URL;
      const state = generateRandomString(32);
      const verifier = generateRandomString(128);
      const challenge = await sha256Base64Url(verifier);

      try {
        sessionStorage.setItem(\`\${STORAGE_PREFIX}:code_verifier\`, verifier);
        sessionStorage.setItem(\`\${STORAGE_PREFIX}:state\`, state);
      } catch (error) {
        console.warn('Unable to persist PKCE verifier in sessionStorage:', error);
      }

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        state,
        code_challenge: challenge,
        code_challenge_method: 'S256',
        scope,
      });

      const trimmedServer = serverUrl.replace(/\\/+$/, '');
      window.location.href = \`\${trimmedServer}/authorize?\${params.toString()}\`;
    }
  }

  if (!customElements.get('auth-agent-signin')) {
    customElements.define('auth-agent-signin', AuthAgentSignInButton);
  }

  function autoRenderFromScript(script) {
    if (!script) return;
    const dataset = script.dataset || {};
    if (dataset.autoRender === 'false') return;

    const containerId = dataset.containerId || dataset.authAgentContainerId;
    let container = null;

    if (containerId) {
      container = document.getElementById(containerId);
    }

    if (!container && script.previousElementSibling && script.previousElementSibling.hasAttribute('data-auth-agent-container')) {
      container = script.previousElementSibling;
    }

    if (!container) {
      container = script.parentElement;
    }

    if (!container) return;

    const element = document.createElement('auth-agent-signin');

    if (dataset.clientId) {
      element.setAttribute('client-id', dataset.clientId);
    }

    if (dataset.redirectUri) {
      element.setAttribute('redirect-uri', dataset.redirectUri);
    }

    if (dataset.serverUrl) {
      element.setAttribute('server-url', dataset.serverUrl);
    }

    if (dataset.scope) {
      element.setAttribute('scope', dataset.scope);
    }

    container.appendChild(element);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => autoRenderFromScript(document.currentScript));
  } else {
    autoRenderFromScript(document.currentScript);
  }
})();`;
}
