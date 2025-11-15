"""
Tests for Auth Agent Agent SDK
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
from auth_agent_sdk.agent import AuthAgentAgentSDK
from auth_agent_sdk.common.errors import AuthAgentValidationError, AuthAgentSecurityError


def test_agent_sdk_creation():
    """Test agent SDK creation."""
    sdk = AuthAgentAgentSDK(
        agent_id='agent_123',
        agent_secret='secret_123',
        model='gpt-4'
    )
    assert sdk.agent_id == 'agent_123'
    assert sdk.agent_secret == 'secret_123'
    assert sdk.model == 'gpt-4'


def test_agent_sdk_reject_missing_fields():
    """Test rejection of missing required fields."""
    with pytest.raises(AuthAgentValidationError):
        AuthAgentAgentSDK(agent_id='', agent_secret='secret', model='gpt-4')
    
    with pytest.raises(AuthAgentValidationError):
        AuthAgentAgentSDK(agent_id='agent', agent_secret='', model='gpt-4')
    
    with pytest.raises(AuthAgentValidationError):
        AuthAgentAgentSDK(agent_id='agent', agent_secret='secret', model='')


def test_extract_request_id_from_html():
    """Test extracting request_id from HTML."""
    sdk = AuthAgentAgentSDK(
        agent_id='agent_123',
        agent_secret='secret_123',
        model='gpt-4'
    )
    
    html = '''
    <script>
        window.authRequest = {
            request_id: 'req_12345'
        };
    </script>
    '''
    
    request_id = sdk.extract_request_id(html)
    assert request_id == 'req_12345'


def test_extract_request_id_alternative_pattern():
    """Test extracting request_id from alternative pattern."""
    sdk = AuthAgentAgentSDK(
        agent_id='agent_123',
        agent_secret='secret_123',
        model='gpt-4'
    )
    
    html = "<script>request_id: 'req_67890'</script>"
    request_id = sdk.extract_request_id(html)
    assert request_id == 'req_67890'


def test_extract_request_id_not_found():
    """Test error when request_id not found."""
    sdk = AuthAgentAgentSDK(
        agent_id='agent_123',
        agent_secret='secret_123',
        model='gpt-4'
    )
    
    html = '<html><body>No request_id here</body></html>'
    
    with pytest.raises(AuthAgentValidationError):
        sdk.extract_request_id(html)


def test_extract_auth_server_url():
    """Test extracting auth server URL."""
    sdk = AuthAgentAgentSDK(
        agent_id='agent_123',
        agent_secret='secret_123',
        model='gpt-4'
    )
    
    url = 'https://auth.auth-agent.com/authorize?client_id=test'
    server_url = sdk._extract_auth_server_url(url)
    assert server_url == 'https://auth.auth-agent.com'


def test_extract_auth_server_url_reject_localhost():
    """Test rejection of localhost URLs."""
    sdk = AuthAgentAgentSDK(
        agent_id='agent_123',
        agent_secret='secret_123',
        model='gpt-4'
    )
    
    with pytest.raises(AuthAgentSecurityError):
        sdk._extract_auth_server_url('http://localhost:3000')



