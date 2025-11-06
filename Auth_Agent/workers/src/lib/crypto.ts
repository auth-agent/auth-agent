import * as jose from 'jose';

/**
 * Generate a cryptographically secure random string
 */
export async function generateSecureRandom(bytes: number): Promise<string> {
  const buffer = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash a secret using PBKDF2
 */
export async function hashSecret(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

  return `${saltHex}:${hashHex}`;
}

/**
 * Verify a secret against its PBKDF2 hash
 */
export async function verifySecret(secret: string, hash: string): Promise<boolean> {
  const [saltHex, expectedHashHex] = hash.split(':');

  if (!saltHex || !expectedHashHex) {
    return false;
  }

  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);

  const key = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex === expectedHashHex;
}

/**
 * Validate PKCE code verifier against code challenge
 */
export async function validatePKCE(
  codeVerifier: string,
  codeChallenge: string,
  method: string
): Promise<boolean> {
  if (method !== 'S256') {
    return false;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // Base64URL encode
  const base64 = btoa(String.fromCharCode(...hashArray));
  const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  return base64url === codeChallenge;
}

/**
 * Generate a JWT access token
 */
export async function generateJWT(payload: {
  agentId: string;
  clientId: string;
  model: string;
  scope: string;
  expiresIn: number;
  issuer: string;
  secret: string;
}): Promise<string> {
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(payload.secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const jwt = await new jose.SignJWT({
    sub: payload.agentId,
    client_id: payload.clientId,
    model: payload.model,
    scope: payload.scope,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(payload.issuer)
    .setIssuedAt()
    .setExpirationTime(`${payload.expiresIn}s`)
    .sign(secretKey);

  return jwt;
}

/**
 * Verify and decode a JWT
 */
export async function verifyJWT(token: string, secret: string): Promise<any> {
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const { payload } = await jose.jwtVerify(token, secretKey);
  return payload;
}
