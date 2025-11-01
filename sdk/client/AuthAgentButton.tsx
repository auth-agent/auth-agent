/**
 * React Component: Sign In with Auth Agent Button
 *
 * Usage:
 * <AuthAgentButton
 *   authServerUrl="http://localhost:3000"
 *   clientId="your_client_id"
 *   redirectUri="https://yoursite.com/callback"
 * />
 */

import React from 'react';
import { createAuthAgentClient, AuthAgentConfig } from './auth-agent-sdk';

export interface AuthAgentButtonProps extends AuthAgentConfig {
  /**
   * Button text
   */
  children?: React.ReactNode;

  /**
   * Custom CSS class
   */
  className?: string;

  /**
   * Custom styles
   */
  style?: React.CSSProperties;

  /**
   * Callback before sign in starts
   */
  onSignInStart?: () => void;

  /**
   * Callback on error
   */
  onError?: (error: Error) => void;
}

export const AuthAgentButton: React.FC<AuthAgentButtonProps> = ({
  authServerUrl,
  clientId,
  redirectUri,
  scope,
  children,
  className,
  style,
  onSignInStart,
  onError,
}) => {
  const handleSignIn = async () => {
    try {
      onSignInStart?.();

      const client = createAuthAgentClient({
        authServerUrl,
        clientId,
        redirectUri,
        scope,
      });

      await client.signIn();
    } catch (error) {
      onError?.(error as Error);
      console.error('Auth Agent sign in error:', error);
    }
  };

  const defaultStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
    background: '#FF6B35', // Vibrant orange matching logo
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
    boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)',
    ...style,
  };

  return (
    <button
      onClick={handleSignIn}
      className={className}
      style={defaultStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.background = '#FF5722'; // Darker orange on hover
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.background = '#FF6B35';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.4)';
      }}
    >
      <img
        src="./AA.png"
        alt="Auth Agent"
        width={24}
        height={24}
        style={{ objectFit: 'contain', display: 'block' }}
      />
      {children || 'Sign in with Auth Agent'}
    </button>
  );
};

/**
 * Minimal/Text-only version
 */
export const AuthAgentButtonMinimal: React.FC<AuthAgentButtonProps> = ({
  authServerUrl,
  clientId,
  redirectUri,
  scope,
  children,
  className,
  style,
  onSignInStart,
  onError,
}) => {
  const handleSignIn = async () => {
    try {
      onSignInStart?.();

      const client = createAuthAgentClient({
        authServerUrl,
        clientId,
        redirectUri,
        scope,
      });

      await client.signIn();
    } catch (error) {
      onError?.(error as Error);
      console.error('Auth Agent sign in error:', error);
    }
  };

  const defaultStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    color: '#FF6B35',
    background: 'transparent',
    border: '2px solid #FF6B35',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ...style,
  };

  return (
    <button
      onClick={handleSignIn}
      className={className}
      style={defaultStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#FF6B35';
        e.currentTarget.style.color = '#fff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = '#FF6B35';
      }}
    >
      <img
        src="./AA.png"
        alt="Auth Agent"
        width={18}
        height={18}
        style={{ objectFit: 'contain', display: 'block' }}
      />
      {children || 'Sign in with Auth Agent'}
    </button>
  );
};

export default AuthAgentButton;
