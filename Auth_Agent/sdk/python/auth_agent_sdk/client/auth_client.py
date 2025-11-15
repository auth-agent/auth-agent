"""
Auth Agent Client SDK - For website backends

OAuth 2.1 client implementation with PKCE support for Python web frameworks.
"""

import secrets
import hashlib
import base64
from typing import Optional, Dict, Any, Tuple, List
from urllib.parse import urlencode

try:
    import aiohttp
    ASYNC_AVAILABLE = True
except ImportError:
    ASYNC_AVAILABLE = False
    import requests

from ..common.errors import AuthAgentError, AuthAgentNetworkError, AuthAgentValidationError, AuthAgentSecurityError
from ..common.validation import validate_url, validate_redirect_uri
from ..common.retry import retry_with_backoff_async, RetryOptions


class AuthAgentClient:
    """
    OAuth 2.1 client for website backends.

    Example:
        client = AuthAgentClient(
            client_id="your_client_id",
            redirect_uri="https://yourapp.com/callback"
        )

        # Initiate sign-in (generates PKCE)
        auth_url, code_verifier, state = client.get_authorization_url()
        # Store code_verifier and state in session

        # Handle callback
        tokens = await client.exchange_code_for_tokens(code, code_verifier)
    """

    def __init__(
        self,
        client_id: str,
        redirect_uri: str,
        client_secret: Optional[str] = None,
        auth_server_url: str = "https://auth.auth-agent.com",
        scope: str = "openid profile",
        allowed_hosts: Optional[List[str]] = None,
        retry_options: Optional[RetryOptions] = None
    ):
        """
        Initialize the Auth Agent client.

        Args:
            client_id: Your client ID from Auth Agent console
            redirect_uri: The callback URL registered in your application
            client_secret: Optional client secret (for confidential clients)
            auth_server_url: Auth Agent server URL (default: production)
            scope: OAuth scope (default: "openid profile")
            allowed_hosts: Optional whitelist of allowed hosts for SSRF protection
            retry_options: Optional retry configuration
        """
        # Validate URLs
        validate_url(auth_server_url, allowed_hosts)
        validate_redirect_uri(redirect_uri)
        
        if not client_id:
            raise AuthAgentValidationError('client_id is required')
        
        self.client_id = client_id
        self.redirect_uri = redirect_uri
        self.client_secret = client_secret
        self.auth_server_url = auth_server_url.rstrip('/')
        self.scope = scope
        self.allowed_hosts = allowed_hosts
        self.retry_options = retry_options or RetryOptions()

    def _generate_code_verifier(self, length: int = 128) -> str:
        """Generate a cryptographically random code verifier."""
        return base64.urlsafe_b64encode(secrets.token_bytes(96)).decode('utf-8').rstrip('=')[:length]

    def _generate_code_challenge(self, verifier: str) -> str:
        """Generate code challenge from verifier using SHA256."""
        digest = hashlib.sha256(verifier.encode('utf-8')).digest()
        return base64.urlsafe_b64encode(digest).decode('utf-8').rstrip('=')

    def _generate_state(self, length: int = 32) -> str:
        """Generate a random state parameter for CSRF protection."""
        return secrets.token_urlsafe(length)

    def get_authorization_url(
        self,
        state: Optional[str] = None
    ) -> Tuple[str, str, str]:
        """
        Get the authorization URL to redirect users to.

        Args:
            state: Optional state parameter (will be generated if not provided)

        Returns:
            Tuple of (authorization_url, code_verifier, state)
            Store code_verifier and state in your session for later verification
        """
        code_verifier = self._generate_code_verifier()
        code_challenge = self._generate_code_challenge(code_verifier)
        state = state or self._generate_state()

        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'response_type': 'code',
            'state': state,
            'code_challenge': code_challenge,
            'code_challenge_method': 'S256',
            'scope': self.scope,
        }

        auth_url = f"{self.auth_server_url}/authorize?{urlencode(params)}"
        
        # Validate the final URL before returning
        validate_url(auth_url, self.allowed_hosts)
        
        return auth_url, code_verifier, state

    async def exchange_code_for_tokens(
        self,
        code: str,
        code_verifier: str
    ) -> Dict[str, Any]:
        """
        Exchange authorization code for tokens (async version).

        Args:
            code: The authorization code from the callback
            code_verifier: The code verifier from the authorization request

        Returns:
            Dictionary containing access_token, refresh_token, etc.

        Raises:
            RuntimeError: If aiohttp is not installed
            Exception: If token exchange fails
        """
        if not ASYNC_AVAILABLE:
            raise RuntimeError("aiohttp is required for async methods. Install with: pip install aiohttp")

        payload = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': self.redirect_uri,
            'client_id': self.client_id,
            'code_verifier': code_verifier,
        }

        if self.client_secret:
            payload['client_secret'] = self.client_secret

        async def _exchange():
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.auth_server_url}/token",
                    json=payload,
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    data = await response.json()

                    if not response.ok:
                        error_msg = (
                            f"Token exchange failed: {data.get('error', 'unknown_error')} - "
                            f"{data.get('error_description', 'No description')}"
                        )
                        raise AuthAgentNetworkError(error_msg)

                    return data
        
        return await retry_with_backoff_async(_exchange, self.retry_options)

    def exchange_code_for_tokens_sync(
        self,
        code: str,
        code_verifier: str
    ) -> Dict[str, Any]:
        """
        Exchange authorization code for tokens (sync version).

        Args:
            code: The authorization code from the callback
            code_verifier: The code verifier from the authorization request

        Returns:
            Dictionary containing access_token, refresh_token, etc.

        Raises:
            Exception: If token exchange fails
        """
        payload = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': self.redirect_uri,
            'client_id': self.client_id,
            'code_verifier': code_verifier,
        }

        if self.client_secret:
            payload['client_secret'] = self.client_secret

        def _exchange():
            response = requests.post(
                f"{self.auth_server_url}/token",
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=self.retry_options.timeout
            )

            data = response.json()

            if not response.ok:
                error_msg = (
                    f"Token exchange failed: {data.get('error', 'unknown_error')} - "
                    f"{data.get('error_description', 'No description')}"
                )
                error = AuthAgentNetworkError(error_msg)
                error.status_code = response.status_code
                raise error

            return data
        
        from ..common.retry import retry_with_backoff
        return retry_with_backoff(_exchange, self.retry_options)

    async def introspect_token(
        self,
        access_token: str
    ) -> Dict[str, Any]:
        """
        Introspect an access token to get user/agent information (async version).

        Args:
            access_token: The access token to introspect

        Returns:
            Dictionary with token information (active, sub, model, etc.)

        Raises:
            RuntimeError: If aiohttp is not installed
        """
        if not ASYNC_AVAILABLE:
            raise RuntimeError("aiohttp is required for async methods. Install with: pip install aiohttp")

        payload = {
            'token': access_token,
            'token_type_hint': 'access_token',
            'client_id': self.client_id,
        }

        if self.client_secret:
            payload['client_secret'] = self.client_secret

        async def _introspect():
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.auth_server_url}/introspect",
                    json=payload,
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    if not response.ok:
                        data = await response.json()
                        error_msg = data.get('error_description', f'HTTP {response.status}')
                        raise AuthAgentNetworkError(f"Token introspection failed: {error_msg}")
                    return await response.json()
        
        return await retry_with_backoff_async(_introspect, self.retry_options)
