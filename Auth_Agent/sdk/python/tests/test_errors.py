"""
Tests for custom error types
"""

import pytest
from auth_agent_sdk.common.errors import (
    AuthAgentError,
    AuthAgentNetworkError,
    AuthAgentTimeoutError,
    AuthAgentValidationError,
    AuthAgentSecurityError,
)


def test_auth_agent_error():
    """Test base AuthAgentError."""
    error = AuthAgentError('Test error', 'TEST_CODE')
    assert error.message == 'Test error'
    assert error.code == 'TEST_CODE'
    assert error.name == 'AuthAgentError'


def test_auth_agent_error_without_code():
    """Test AuthAgentError without code."""
    error = AuthAgentError('Test error')
    assert error.message == 'Test error'
    assert error.code is None


def test_auth_agent_network_error():
    """Test AuthAgentNetworkError."""
    original_error = Exception('Original error')
    error = AuthAgentNetworkError('Network failed', original_error)
    assert error.message == 'Network failed'
    assert error.code == 'NETWORK_ERROR'
    assert error.original_error == original_error
    assert error.name == 'AuthAgentNetworkError'


def test_auth_agent_network_error_without_original():
    """Test AuthAgentNetworkError without original error."""
    error = AuthAgentNetworkError('Network failed')
    assert error.message == 'Network failed'
    assert error.original_error is None


def test_auth_agent_timeout_error():
    """Test AuthAgentTimeoutError."""
    error = AuthAgentTimeoutError()
    assert error.message == 'Request timeout'
    assert error.code == 'TIMEOUT'
    assert error.name == 'AuthAgentTimeoutError'


def test_auth_agent_timeout_error_custom_message():
    """Test AuthAgentTimeoutError with custom message."""
    error = AuthAgentTimeoutError('Custom timeout')
    assert error.message == 'Custom timeout'


def test_auth_agent_validation_error():
    """Test AuthAgentValidationError."""
    error = AuthAgentValidationError('Invalid input')
    assert error.message == 'Invalid input'
    assert error.code == 'VALIDATION_ERROR'
    assert error.name == 'AuthAgentValidationError'


def test_auth_agent_security_error():
    """Test AuthAgentSecurityError."""
    error = AuthAgentSecurityError('Security violation')
    assert error.message == 'Security violation'
    assert error.code == 'SECURITY_ERROR'
    assert error.name == 'AuthAgentSecurityError'



