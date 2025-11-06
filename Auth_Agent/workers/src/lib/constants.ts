export const CONFIG = {
  DEFAULT_SCOPE: 'openid profile email',
  SUPPORTED_GRANT_TYPES: ['authorization_code', 'refresh_token'],
  SUPPORTED_CODE_CHALLENGE_METHODS: ['S256'],
  AUTH_REQUEST_TTL: 600, // 10 minutes in seconds
  AUTH_CODE_TTL: 600, // 10 minutes in seconds
  ACCESS_TOKEN_TTL: 3600, // 1 hour in seconds
  REFRESH_TOKEN_TTL: 2592000, // 30 days in seconds
};
