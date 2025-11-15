/**
 * Auth Agent React Components
 */

import React, { useState } from 'react';
import { createAuthAgentClient } from './index';

export interface AuthAgentButtonProps {
  clientId: string;
  redirectUri: string;
  authServerUrl?: string;
  text?: string;
  className?: string;
  scope?: string;
  onSignInStart?: () => void;
  onError?: (error: Error) => void;
}

export function AuthAgentButton(props: AuthAgentButtonProps) {
  const {
    clientId,
    redirectUri,
    authServerUrl = 'https://auth.auth-agent.com',
    text = 'Sign in with Auth Agent',
    className = '',
    scope,
    onSignInStart,
    onError,
  } = props;

  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      onSignInStart?.();

      const client = createAuthAgentClient({
        authServerUrl,
        clientId,
        redirectUri,
        scope,
      });

      await client.signIn();
    } catch (error) {
      setLoading(false);
      onError?.(error as Error);
      console.error('Auth Agent sign in error:', error);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`auth-agent-button ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 24px',
        background: loading ? '#d1d5db' : 'linear-gradient(to right, #f97316, #ea580c)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        opacity: loading ? 0.7 : 1,
      }}
    >
      <span>{loading ? 'Redirecting...' : text}</span>
    </button>
  );
}
