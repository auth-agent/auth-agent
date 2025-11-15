"""
Tests for URL validation and SSRF protection
"""

import pytest
from auth_agent_sdk.common.validation import validate_url, validate_redirect_uri
from auth_agent_sdk.common.errors import AuthAgentSecurityError, AuthAgentValidationError


def test_validate_url_https():
    """Test validation of HTTPS URLs."""
    url = validate_url('https://auth.auth-agent.com/authorize')
    assert url.scheme == 'https'
    assert url.hostname == 'auth.auth-agent.com'


def test_validate_url_http():
    """Test validation of HTTP URLs."""
    url = validate_url('http://example.com')
    assert url.scheme == 'http'
    assert url.hostname == 'example.com'


def test_validate_url_reject_non_http():
    """Test rejection of non-HTTP protocols."""
    with pytest.raises(AuthAgentSecurityError):
        validate_url('ftp://example.com')
    
    with pytest.raises(AuthAgentSecurityError):
        validate_url('file:///etc/passwd')


def test_validate_url_block_localhost():
    """Test blocking of localhost."""
    with pytest.raises(AuthAgentSecurityError):
        validate_url('http://localhost:3000')
    
    with pytest.raises(AuthAgentSecurityError):
        validate_url('https://127.0.0.1')


def test_validate_url_block_private_ips():
    """Test blocking of private IP ranges."""
    with pytest.raises(AuthAgentSecurityError):
        validate_url('http://192.168.1.1')
    
    with pytest.raises(AuthAgentSecurityError):
        validate_url('http://10.0.0.1')
    
    with pytest.raises(AuthAgentSecurityError):
        validate_url('http://172.16.0.1')


def test_validate_url_allowed_hosts():
    """Test allowed hosts whitelist."""
    url = validate_url('https://auth.auth-agent.com', ['auth.auth-agent.com'])
    assert url.hostname == 'auth.auth-agent.com'
    
    with pytest.raises(AuthAgentSecurityError):
        validate_url('https://evil.com', ['auth.auth-agent.com'])


def test_validate_url_invalid():
    """Test rejection of invalid URLs."""
    with pytest.raises(AuthAgentValidationError):
        validate_url('not-a-url')
    
    with pytest.raises(AuthAgentValidationError):
        validate_url('')


def test_validate_redirect_uri_https():
    """Test validation of HTTPS redirect URIs."""
    validate_redirect_uri('https://example.com/callback')
    # Should not raise


def test_validate_redirect_uri_localhost():
    """Test acceptance of HTTP for localhost."""
    validate_redirect_uri('http://localhost:3000/callback')
    validate_redirect_uri('http://127.0.0.1:3000/callback')
    # Should not raise


def test_validate_redirect_uri_reject_http_production():
    """Test rejection of HTTP in production."""
    with pytest.raises(AuthAgentValidationError):
        validate_redirect_uri('http://example.com/callback')


def test_validate_redirect_uri_reject_non_http():
    """Test rejection of non-HTTP protocols."""
    with pytest.raises(AuthAgentValidationError):
        validate_redirect_uri('ftp://example.com')



