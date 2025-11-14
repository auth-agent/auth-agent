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

// Branding colors - enforced
const BRAND_COLORS = {
  primary: '#FF6B35',
  primaryHover: '#FF5722',
  text: '#fff',
  textMinimal: '#FF6B35',
} as const;

// Color-related CSS properties that cannot be overridden
const PROTECTED_COLOR_PROPERTIES = [
  'color',
  'background',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
] as const;

/**
 * Validates that button text contains "Auth Agent" branding
 */
function validateButtonText(text: React.ReactNode): boolean {
  if (!text) return true; // Default text is valid
  const textStr = String(text).toLowerCase();
  return textStr.includes('auth agent') || textStr.includes('auth-agent');
}

/**
 * Filters out color-related properties from style object
 */
function filterColorProperties(style?: React.CSSProperties): React.CSSProperties {
  if (!style) return {};
  
  const filtered: React.CSSProperties = {};
  for (const key in style) {
    if (style.hasOwnProperty(key) && !PROTECTED_COLOR_PROPERTIES.includes(key as any)) {
      filtered[key as keyof React.CSSProperties] = style[key as keyof React.CSSProperties];
    }
  }
  return filtered;
}

export interface AuthAgentButtonProps extends AuthAgentConfig {
  /**
   * Button text - MUST contain "Auth Agent" or "auth-agent" for branding compliance
   * @example "Sign in with Auth Agent"
   * @example "Continue with Auth Agent"
   */
  children?: React.ReactNode;

  /**
   * Custom CSS class - color-related classes will be ignored
   * Only layout, spacing, and non-color styling allowed
   */
  className?: string;

  /**
   * Custom styles - color properties (background, color, borderColor) are protected and cannot be overridden
   * Only layout, spacing, and non-color properties are allowed
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
  // Validate button text contains branding
  const buttonText = children || 'Sign in with Auth Agent';
  if (!validateButtonText(buttonText)) {
    console.warn(
      'AuthAgentButton: Button text must contain "Auth Agent" or "auth-agent" for branding compliance. Using default text.'
    );
  }

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

  // Filter out color properties from custom style
  const allowedStyle = filterColorProperties(style);

  // Enforced branding styles - color properties will be set with !important via ref
  const enforcedStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
    ...allowedStyle, // Only non-color properties from custom style
  };

  // Use ref to enforce color properties with !important
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  
  React.useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.style.setProperty('color', BRAND_COLORS.text, 'important');
      buttonRef.current.style.setProperty('background', BRAND_COLORS.primary, 'important');
      buttonRef.current.style.setProperty('box-shadow', '0 4px 12px rgba(255, 107, 53, 0.4)', 'important');
    }
  }, []);

  return (
    <button
      ref={buttonRef}
      onClick={handleSignIn}
      className={className}
      style={enforcedStyle}
      data-auth-agent-button="true"
      onMouseEnter={(e) => {
        e.currentTarget.style.setProperty('transform', 'translateY(-2px)', 'important');
        e.currentTarget.style.setProperty('background', BRAND_COLORS.primaryHover, 'important');
        e.currentTarget.style.setProperty('box-shadow', '0 6px 16px rgba(255, 107, 53, 0.5)', 'important');
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.setProperty('transform', 'translateY(0)', 'important');
        e.currentTarget.style.setProperty('background', BRAND_COLORS.primary, 'important');
        e.currentTarget.style.setProperty('box-shadow', '0 4px 12px rgba(255, 107, 53, 0.4)', 'important');
      }}
    >
      <img
        src="./AA.png"
        alt="Auth Agent"
        width={24}
        height={24}
        style={{ objectFit: 'contain', display: 'block' }}
      />
      {validateButtonText(buttonText) ? buttonText : 'Sign in with Auth Agent'}
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
  // Validate button text contains branding
  const buttonText = children || 'Sign in with Auth Agent';
  if (!validateButtonText(buttonText)) {
    console.warn(
      'AuthAgentButtonMinimal: Button text must contain "Auth Agent" or "auth-agent" for branding compliance. Using default text.'
    );
  }

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

  // Filter out color properties from custom style
  const allowedStyle = filterColorProperties(style);

  // Enforced branding styles - color properties will be set with !important via ref
  const enforcedStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ...allowedStyle, // Only non-color properties from custom style
  };

  // Use ref to enforce color properties with !important
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  
  React.useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.style.setProperty('color', BRAND_COLORS.textMinimal, 'important');
      buttonRef.current.style.setProperty('background', 'transparent', 'important');
      buttonRef.current.style.setProperty('border', `2px solid ${BRAND_COLORS.primary}`, 'important');
    }
  }, []);

  return (
    <button
      ref={buttonRef}
      onClick={handleSignIn}
      className={className}
      style={enforcedStyle}
      data-auth-agent-button="minimal"
      onMouseEnter={(e) => {
        e.currentTarget.style.setProperty('background', BRAND_COLORS.primary, 'important');
        e.currentTarget.style.setProperty('color', BRAND_COLORS.text, 'important');
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.setProperty('background', 'transparent', 'important');
        e.currentTarget.style.setProperty('color', BRAND_COLORS.textMinimal, 'important');
      }}
    >
      <img
        src="./AA.png"
        alt="Auth Agent"
        width={18}
        height={18}
        style={{ objectFit: 'contain', display: 'block' }}
      />
      {validateButtonText(buttonText) ? buttonText : 'Sign in with Auth Agent'}
    </button>
  );
};

export default AuthAgentButton;
