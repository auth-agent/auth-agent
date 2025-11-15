"""
Tests for Auth Agent Client SDK
"""

import pytest
from auth_agent_sdk.client import AuthAgentClient
from auth_agent_sdk.common.errors import AuthAgentValidationError, AuthAgentSecurityError


def test_client_creation():
    """Test client creation with valid config."""
    client = AuthAgentClient(
        client_id='test_client',
        redirect_uri='https://example.com/callback'
    )
    assert client.client_id == 'test_client'
    assert client.redirect_uri == 'https://example.com/callback'


def test_client_reject_invalid_auth_server_url():
    """Test rejection of invalid auth server URL."""
    with pytest.raises(AuthAgentSecurityError):
        AuthAgentClient(
            client_id='test',
            redirect_uri='https://example.com/callback',
            auth_server_url='ftp://evil.com'
        )


def test_client_reject_localhost_auth_server():
    """Test rejection of localhost auth server."""
    with pytest.raises(AuthAgentSecurityError):
        AuthAgentClient(
            client_id='test',
            redirect_uri='https://example.com/callback',
            auth_server_url='http://localhost:3000'
        )


def test_client_reject_invalid_redirect_uri():
    """Test rejection of invalid redirect URI."""
    with pytest.raises(AuthAgentValidationError):
        AuthAgentClient(
            client_id='test',
            redirect_uri='ftp://example.com/callback'
        )


def test_client_accept_localhost_redirect_uri():
    """Test acceptance of localhost redirect URI."""
    client = AuthAgentClient(
        client_id='test',
        redirect_uri='http://localhost:3000/callback'
    )
    assert client is not None


def test_client_default_scope():
    """Test default scope."""
    client = AuthAgentClient(
        client_id='test',
        redirect_uri='https://example.com/callback'
    )
    assert client.scope == 'openid profile'


def test_client_custom_scope():
    """Test custom scope."""
    client = AuthAgentClient(
        client_id='test',
        redirect_uri='https://example.com/callback',
        scope='openid profile email'
    )
    assert client.scope == 'openid profile email'


def test_client_allowed_hosts():
    """Test allowed hosts whitelist."""
    client = AuthAgentClient(
        client_id='test',
        redirect_uri='https://example.com/callback',
        allowed_hosts=['auth.auth-agent.com']
    )
    assert client.allowed_hosts == ['auth.auth-agent.com']


def test_get_authorization_url():
    """Test getting authorization URL."""
    client = AuthAgentClient(
        client_id='test_client',
        redirect_uri='https://example.com/callback'
    )
    
    auth_url, code_verifier, state = client.get_authorization_url()
    
    assert 'https://auth.auth-agent.com/authorize' in auth_url
    assert 'client_id=test_client' in auth_url
    assert 'code_challenge=' in auth_url
    assert 'code_challenge_method=S256' in auth_url
    assert code_verifier is not None
    assert len(code_verifier) > 100
    assert state is not None
    assert len(state) > 20



