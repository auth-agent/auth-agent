"""
Auth Agent SDK for AI Agents (Python)

This SDK helps AI agents authenticate with Auth Agent OAuth 2.1 server.

Usage:
    from auth_agent_sdk.agent import AuthAgentSDK

    sdk = AuthAgentSDK(
        agent_id='agent_xxx',
        agent_secret='secret_xxx',
        model='gpt-4'
    )

    # Complete flow - extracts server URL from authorization URL automatically
    status = await sdk.complete_authentication_flow_async(authorization_url)
    print(f'Authorization code: {status["code"]}')
"""

import re
import json
import time
from typing import Optional, Dict, Any, Callable, List
from urllib.parse import urlencode, urlparse
try:
    import aiohttp
    ASYNC_AVAILABLE = True
except ImportError:
    ASYNC_AVAILABLE = False
    import requests

from ..common.errors import (
    AuthAgentError,
    AuthAgentNetworkError,
    AuthAgentTimeoutError,
    AuthAgentValidationError,
    AuthAgentSecurityError,
)
from ..common.validation import validate_url
from ..common.retry import retry_with_backoff, retry_with_backoff_async, RetryOptions


class AuthAgentSDK:
    """SDK for AI agents to authenticate with Auth Agent OAuth 2.1 server."""

    def __init__(
        self,
        agent_id: str,
        agent_secret: str,
        model: str,
        allowed_hosts: Optional[List[str]] = None,
        retry_options: Optional[RetryOptions] = None
    ):
        """
        Initialize Auth Agent SDK.

        Args:
            agent_id: Agent ID registered with Auth Agent
            agent_secret: Agent secret (keep secure!)
            model: Model identifier (e.g., 'gpt-4', 'claude-3.5-sonnet')
            allowed_hosts: Optional whitelist of allowed hosts for SSRF protection
            retry_options: Optional retry configuration
        """
        if not agent_id or not agent_secret or not model:
            raise AuthAgentValidationError('agent_id, agent_secret, and model are required')
        
        self.auth_server_url: Optional[str] = None
        self.agent_id = agent_id
        self.agent_secret = agent_secret
        self.model = model
        self.allowed_hosts = allowed_hosts
        self.retry_options = retry_options or RetryOptions()

    def _extract_auth_server_url(self, authorization_url: str) -> str:
        """
        Extract base URL from authorization URL with validation.

        Args:
            authorization_url: Full authorization URL

        Returns:
            Base URL (protocol + host)
        """
        try:
            parsed = validate_url(authorization_url, self.allowed_hosts)
            return f"{parsed.scheme}://{parsed.netloc}"
        except (AuthAgentSecurityError, AuthAgentValidationError):
            raise
        except Exception as e:
            raise AuthAgentValidationError(f"Invalid authorization URL: {authorization_url}") from e

    def _get_auth_server_url(self, authorization_url: str) -> str:
        """
        Get or extract auth server URL.

        Args:
            authorization_url: Authorization URL to extract from

        Returns:
            Base URL of auth server
        """
        if not self.auth_server_url:
            self.auth_server_url = self._extract_auth_server_url(authorization_url)
        return self.auth_server_url

    def extract_request_id(self, authorization_url_or_html: str) -> str:
        """
        Extract request_id from authorization page HTML or URL.

        Args:
            authorization_url_or_html: Full authorization URL or HTML content

        Returns:
            request_id string

        Raises:
            ValueError: If request_id cannot be extracted
            RuntimeError: If using async methods without aiohttp
        """
        # If it's a URL, extract auth server URL and fetch the HTML
        if authorization_url_or_html.startswith('http://') or authorization_url_or_html.startswith('https://'):
            # Extract and store auth server URL
            self.auth_server_url = self._extract_auth_server_url(authorization_url_or_html)
            # It's a URL - fetch it
            if ASYNC_AVAILABLE:
                raise RuntimeError("Use extract_request_id_async() for async requests, or install 'requests' for sync")
            else:
                import requests
                def _fetch():
                    response = requests.get(
                        authorization_url_or_html,
                        timeout=self.retry_options.timeout
                    )
                    response.raise_for_status()
                    return response.text
                
                html = retry_with_backoff(_fetch, self.retry_options)
        else:
            # Assume it's HTML content
            html = authorization_url_or_html

        # Try to extract from window.authRequest in script tag
        window_auth_match = re.search(
            r'window\.authRequest\s*=\s*\{[^}]*request_id:\s*[\'"]([^\'"]+)[\'"]',
            html
        )
        if window_auth_match:
            return window_auth_match.group(1)

        # Try alternative pattern: request_id: '...'
        direct_match = re.search(
            r'request_id:\s*[\'"]([^\'"]+)[\'"]',
            html
        )
        if direct_match:
            return direct_match.group(1)

        # Try extracting from script tag more flexibly
        script_match = re.search(
            r'<script[^>]*>[\s\S]*?request_id[^}]*[\'"]([^\'"]+)[\'"]',
            html
        )
        if script_match:
            return script_match.group(1)

        raise AuthAgentValidationError(
            'Could not extract request_id from authorization page. Make sure the page is loaded correctly and contains window.authRequest.request_id.'
        )

    async def extract_request_id_async(self, authorization_url_or_html: str) -> str:
        """
        Extract request_id from authorization page HTML or URL (async version).

        Args:
            authorization_url_or_html: Full authorization URL or HTML content

        Returns:
            request_id string

        Raises:
            ValueError: If request_id cannot be extracted
            RuntimeError: If aiohttp is not installed
        """
        if not ASYNC_AVAILABLE:
            raise RuntimeError("aiohttp is required for async methods. Install with: pip install aiohttp")

        # If it's a URL, extract auth server URL and fetch the HTML
        if authorization_url_or_html.startswith('http://') or authorization_url_or_html.startswith('https://'):
            # Extract and store auth server URL
            self.auth_server_url = self._extract_auth_server_url(authorization_url_or_html)
            
            async def _fetch():
                async with aiohttp.ClientSession() as session:
                    async with session.get(authorization_url_or_html) as response:
                        if not response.ok:
                            raise AuthAgentNetworkError(
                                f"Failed to fetch authorization page: {response.status} {response.reason}"
                            )
                        return await response.text()
            
            html = await retry_with_backoff_async(_fetch, self.retry_options)
        else:
            # Assume it's HTML content
            html = authorization_url_or_html

        # Use same extraction logic as sync version
        return self.extract_request_id(html)

    def authenticate(self, request_id: str, authorization_url: str) -> Dict[str, Any]:
        """
        Authenticate the agent with Auth Agent server.

        Args:
            request_id: Request ID extracted from authorization page
            authorization_url: Authorization URL (used to extract server URL)

        Returns:
            Authentication result dictionary with 'success', 'message', 'error', etc.

        Raises:
            RuntimeError: If using async methods without aiohttp
        """
        auth_server_url = self._get_auth_server_url(authorization_url)
        url = f"{auth_server_url}/api/agent/authenticate"

        payload = {
            'request_id': request_id,
            'agent_id': self.agent_id,
            'agent_secret': self.agent_secret,
            'model': self.model,
        }

        if ASYNC_AVAILABLE:
            raise RuntimeError("Use authenticate_async() for async requests, or install 'requests' for sync")
        else:
            import requests
            def _authenticate():
                response = requests.post(
                    url,
                    json=payload,
                    timeout=self.retry_options.timeout
                )
                data = response.json()
                
                if not response.ok:
                    error_msg = (
                        f"Authentication failed: {data.get('error_description', data.get('error', f'HTTP {response.status_code}'))}"
                    )
                    error = AuthAgentNetworkError(error_msg)
                    error.status_code = response.status_code
                    raise error
                
                return {
                    'success': True,
                    'message': data.get('message', 'Agent authenticated successfully'),
                }
            
            try:
                return retry_with_backoff(_authenticate, self.retry_options)
            except AuthAgentNetworkError as e:
                return {
                    'success': False,
                    'error': 'network_error',
                    'error_description': e.message,
                }
            except Exception as e:
                return {
                    'success': False,
                    'error': 'network_error',
                    'error_description': str(e),
                }

    async def authenticate_async(self, request_id: str, authorization_url: str) -> Dict[str, Any]:
        """
        Authenticate the agent with Auth Agent server (async version).

        Args:
            request_id: Request ID extracted from authorization page
            authorization_url: Authorization URL (used to extract server URL)

        Returns:
            Authentication result dictionary with 'success', 'message', 'error', etc.

        Raises:
            RuntimeError: If aiohttp is not installed
        """
        if not ASYNC_AVAILABLE:
            raise RuntimeError("aiohttp is required for async methods. Install with: pip install aiohttp")

        auth_server_url = self._get_auth_server_url(authorization_url)
        url = f"{auth_server_url}/api/agent/authenticate"

        payload = {
            'request_id': request_id,
            'agent_id': self.agent_id,
            'agent_secret': self.agent_secret,
            'model': self.model,
        }

        async def _authenticate():
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as response:
                    data = await response.json()
                    
                    if not response.ok:
                        error_msg = (
                            f"Authentication failed: {data.get('error_description', data.get('error', f'HTTP {response.status}'))}"
                        )
                        error = AuthAgentNetworkError(error_msg)
                        error.status_code = response.status
                        raise error

                    return {
                        'success': True,
                        'message': data.get('message', 'Agent authenticated successfully'),
                        'requires_2fa': data.get('requires_2fa', False),
                        'expires_in': data.get('expires_in'),
                        'data': data,
                    }
        
        try:
            return await retry_with_backoff_async(_authenticate, self.retry_options)
        except AuthAgentNetworkError as e:
            return {
                'success': False,
                'error': 'network_error',
                'error_description': e.message,
            }
        except Exception as e:
            return {
                'success': False,
                'error': 'network_error',
                'error_description': str(e),
            }

    async def verify_2fa_async(self, request_id: str, code: str, authorization_url: str) -> Dict[str, Any]:
        """
        Verify 2FA code with Auth Agent server (async version).

        Args:
            request_id: Request ID from the initial authentication
            code: 6-digit verification code from email
            authorization_url: Authorization URL (used to extract server URL)

        Returns:
            Verification result dictionary with 'success', 'message', 'error', etc.

        Raises:
            RuntimeError: If aiohttp is not installed
        """
        if not ASYNC_AVAILABLE:
            raise RuntimeError("aiohttp is required for async methods. Install with: pip install aiohttp")

        auth_server_url = self._get_auth_server_url(authorization_url)
        url = f"{auth_server_url}/api/agent/verify-2fa"

        payload = {
            'request_id': request_id,
            'code': code,
            'model': self.model,
        }

        async def _verify():
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as response:
                    data = await response.json()

                    if not response.ok:
                        error_msg = (
                            f"2FA verification failed: {data.get('error_description', data.get('error', f'HTTP {response.status}'))}"
                        )
                        error = AuthAgentNetworkError(error_msg)
                        error.status_code = response.status
                        raise error

                    return {
                        'success': True,
                        'message': data.get('message', '2FA verification successful'),
                        'data': data,
                    }
        
        try:
            return await retry_with_backoff_async(_verify, self.retry_options)
        except AuthAgentNetworkError as e:
            return {
                'success': False,
                'error': 'network_error',
                'error_description': e.message,
            }
        except Exception as e:
            return {
                'success': False,
                'error': 'network_error',
                'error_description': str(e),
            }

    def check_status(self, request_id: str, authorization_url: str) -> Dict[str, Any]:
        """
        Check authentication status.

        Args:
            request_id: Request ID to check
            authorization_url: Authorization URL (used to extract server URL)

        Returns:
            Status dictionary with 'status', 'code', 'redirect_uri', etc.

        Raises:
            RuntimeError: If using async methods without aiohttp
        """
        auth_server_url = self._get_auth_server_url(authorization_url)
        url = f"{auth_server_url}/api/check-status"
        params = {'request_id': request_id}

        if ASYNC_AVAILABLE:
            raise RuntimeError("Use check_status_async() for async requests, or install 'requests' for sync")
        else:
            import requests
            def _check():
                response = requests.get(
                    url,
                    params=params,
                    timeout=self.retry_options.timeout
                )
                if not response.ok:
                    raise AuthAgentNetworkError(
                        f"Status check failed: {response.status_code} {response.reason}"
                    )
                return response.json()
            
            return retry_with_backoff(_check, self.retry_options)

    async def check_status_async(self, request_id: str, authorization_url: str) -> Dict[str, Any]:
        """
        Check authentication status (async version).

        Args:
            request_id: Request ID to check
            authorization_url: Authorization URL (used to extract server URL)

        Returns:
            Status dictionary with 'status', 'code', 'redirect_uri', etc.

        Raises:
            RuntimeError: If aiohttp is not installed
        """
        if not ASYNC_AVAILABLE:
            raise RuntimeError("aiohttp is required for async methods. Install with: pip install aiohttp")

        auth_server_url = self._get_auth_server_url(authorization_url)
        url = f"{auth_server_url}/api/check-status"
        params = {'request_id': request_id}

        async def _check():
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if not response.ok:
                        raise AuthAgentNetworkError(
                            f"Status check failed: {response.status} {response.reason}"
                        )
                    return await response.json()
        
        return await retry_with_backoff_async(_check, self.retry_options)

    def wait_for_authentication(
        self,
        request_id: str,
        authorization_url: str,
        poll_interval: float = 0.5,
        timeout: float = 60.0,
        on_status_update: Optional[Callable[[Dict[str, Any]], None]] = None
    ) -> Dict[str, Any]:
        """
        Wait for authentication to complete by polling status.

        Args:
            request_id: Request ID to poll
            authorization_url: Authorization URL (used to extract server URL)
            poll_interval: Seconds between polls (default: 0.5)
            timeout: Maximum wait time in seconds (default: 60.0)
            on_status_update: Optional callback function called on each status check

        Returns:
            Final status dictionary with authorization code

        Raises:
            TimeoutError: If authentication times out
            RuntimeError: If using async methods without aiohttp
        """
        start_time = time.time()

        while True:
            # Check timeout
            if time.time() - start_time > timeout:
                raise TimeoutError('Authentication timeout - exceeded maximum wait time')

            # Check status
            status = self.check_status(request_id, authorization_url)

            # Call status update callback
            if on_status_update:
                on_status_update(status)

            # Check if authentication completed
            if status.get('status') in ('authenticated', 'completed'):
                return status

            # Check if there was an error
            if status.get('status') in ('error', 'expired'):
                error_msg = status.get('error', 'Authentication failed')
                raise RuntimeError(error_msg)

            # Still pending, wait and continue polling
            time.sleep(poll_interval)

    async def wait_for_authentication_async(
        self,
        request_id: str,
        authorization_url: str,
        poll_interval: float = 0.5,
        timeout: float = 60.0,
        on_status_update: Optional[Callable[[Dict[str, Any]], None]] = None
    ) -> Dict[str, Any]:
        """
        Wait for authentication to complete by polling status (async version).

        Args:
            request_id: Request ID to poll
            authorization_url: Authorization URL (used to extract server URL)
            poll_interval: Seconds between polls (default: 0.5)
            timeout: Maximum wait time in seconds (default: 60.0)
            on_status_update: Optional callback function called on each status check

        Returns:
            Final status dictionary with authorization code

        Raises:
            TimeoutError: If authentication times out
            RuntimeError: If aiohttp is not installed
        """
        if not ASYNC_AVAILABLE:
            raise RuntimeError("aiohttp is required for async methods. Install with: pip install aiohttp")

        import asyncio
        start_time = time.time()

        while True:
            # Check timeout
            if time.time() - start_time > timeout:
                raise TimeoutError('Authentication timeout - exceeded maximum wait time')

            # Check status
            status = await self.check_status_async(request_id, authorization_url)

            # Call status update callback
            if on_status_update:
                on_status_update(status)

            # Check if authentication completed
            if status.get('status') in ('authenticated', 'completed'):
                return status

            # Check if there was an error
            if status.get('status') in ('error', 'expired'):
                error_msg = status.get('error', 'Authentication failed')
                raise RuntimeError(error_msg)

            # Still pending, wait and continue polling
            await asyncio.sleep(poll_interval)

    def complete_authentication_flow(
        self,
        authorization_url: str,
        poll_interval: float = 0.5,
        timeout: float = 60.0,
        on_status_update: Optional[Callable[[Dict[str, Any]], None]] = None
    ) -> Dict[str, Any]:
        """
        Complete authentication flow: extract request_id, authenticate, and wait.

        Args:
            authorization_url: Full authorization URL
            poll_interval: Seconds between polls (default: 0.5)
            timeout: Maximum wait time in seconds (default: 60.0)
            on_status_update: Optional callback function called on each status check

        Returns:
            Final status dictionary with authorization code

        Raises:
            RuntimeError: If using async methods without aiohttp
        """
        # Step 1: Extract request_id (also extracts and stores auth server URL)
        request_id = self.extract_request_id(authorization_url)

        # Step 2: Authenticate
        auth_result = self.authenticate(request_id, authorization_url)

        if not auth_result.get('success'):
            error_desc = auth_result.get('error_description') or auth_result.get('error', 'Authentication failed')
            raise RuntimeError(error_desc)

        # Step 3: Wait for completion
        return self.wait_for_authentication(request_id, authorization_url, poll_interval, timeout, on_status_update)

    async def complete_authentication_flow_async(
        self,
        authorization_url: str,
        poll_interval: float = 0.5,
        timeout: float = 60.0,
        on_status_update: Optional[Callable[[Dict[str, Any]], None]] = None
    ) -> Dict[str, Any]:
        """
        Complete authentication flow: extract request_id, authenticate, and wait (async version).

        Args:
            authorization_url: Full authorization URL
            poll_interval: Seconds between polls (default: 0.5)
            timeout: Maximum wait time in seconds (default: 60.0)
            on_status_update: Optional callback function called on each status check

        Returns:
            Final status dictionary with authorization code

        Raises:
            RuntimeError: If aiohttp is not installed
        """
        # Step 1: Extract request_id (also extracts and stores auth server URL)
        request_id = await self.extract_request_id_async(authorization_url)

        # Step 2: Authenticate
        auth_result = await self.authenticate_async(request_id, authorization_url)

        if not auth_result.get('success'):
            error_desc = auth_result.get('error_description') or auth_result.get('error', 'Authentication failed')
            raise RuntimeError(error_desc)

        # Step 3: Wait for completion
        return await self.wait_for_authentication_async(request_id, authorization_url, poll_interval, timeout, on_status_update)


def create_auth_agent_agent_sdk(
    agent_id: str,
    agent_secret: str,
    model: str
) -> AuthAgentSDK:
    """Create a new Auth Agent SDK instance for AI agents."""
    return AuthAgentSDK(agent_id, agent_secret, model)

