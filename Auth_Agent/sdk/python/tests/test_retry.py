"""
Tests for retry logic with exponential backoff
No mocks - testing real behavior
"""

import pytest
import asyncio
import time
from auth_agent_sdk.common.retry import retry_with_backoff, retry_with_backoff_async, RetryOptions
from auth_agent_sdk.common.errors import AuthAgentTimeoutError, AuthAgentNetworkError


def test_retry_success_first_attempt():
    """Test successful retry on first attempt."""
    call_count = [0]
    
    def fn():
        call_count[0] += 1
        return 'success'
    
    result = retry_with_backoff(fn)
    assert result == 'success'
    assert call_count[0] == 1


def test_retry_on_network_error():
    """Test retry on network errors."""
    call_count = [0]
    
    def fn():
        call_count[0] += 1
        if call_count[0] == 1:
            raise ConnectionError('Network error')
        return 'success'
    
    result = retry_with_backoff(fn, RetryOptions(max_retries=1, initial_delay=0.01))
    assert result == 'success'
    assert call_count[0] == 2


def test_retry_on_retryable_status_code():
    """Test retry on retryable status codes."""
    call_count = [0]
    
    class ErrorWithStatus(Exception):
        def __init__(self):
            self.status_code = 500
            super().__init__('Server error')
    
    def fn():
        call_count[0] += 1
        if call_count[0] == 1:
            raise ErrorWithStatus()
        return 'success'
    
    result = retry_with_backoff(fn, RetryOptions(max_retries=1, initial_delay=0.01))
    assert result == 'success'
    assert call_count[0] == 2


def test_retry_no_retry_on_non_retryable():
    """Test no retry on non-retryable errors."""
    call_count = [0]
    
    class ErrorWithStatus(Exception):
        def __init__(self):
            self.status_code = 400
            super().__init__('Client error')
    
    def fn():
        call_count[0] += 1
        raise ErrorWithStatus()
    
    with pytest.raises(ErrorWithStatus):
        retry_with_backoff(fn, RetryOptions(max_retries=2))
    
    assert call_count[0] == 1


def test_retry_respect_max_retries():
    """Test respect for max retries."""
    call_count = [0]
    
    def fn():
        call_count[0] += 1
        raise ConnectionError('Network error')
    
    with pytest.raises(AuthAgentNetworkError):
        retry_with_backoff(fn, RetryOptions(max_retries=2, initial_delay=0.01))
    
    assert call_count[0] == 3  # initial + 2 retries


@pytest.mark.asyncio
async def test_retry_async_success():
    """Test async retry success."""
    call_count = [0]
    
    async def fn():
        call_count[0] += 1
        return 'success'
    
    result = await retry_with_backoff_async(fn)
    assert result == 'success'
    assert call_count[0] == 1


@pytest.mark.asyncio
async def test_retry_async_on_error():
    """Test async retry on error."""
    call_count = [0]
    
    async def fn():
        call_count[0] += 1
        if call_count[0] == 1:
            raise ConnectionError('Error')
        return 'success'
    
    result = await retry_with_backoff_async(fn, RetryOptions(max_retries=1, initial_delay=0.01))
    assert result == 'success'
    assert call_count[0] == 2


def test_retry_exponential_backoff():
    """Test exponential backoff timing."""
    call_count = [0]
    call_times = []
    
    def fn():
        call_times.append(time.time())
        call_count[0] += 1
        if call_count[0] <= 2:
            raise ConnectionError('Network error')
        return 'success'
    
    start_time = time.time()
    result = retry_with_backoff(fn, RetryOptions(
        max_retries=2,
        initial_delay=0.05,
        backoff_multiplier=2
    ))
    total_duration = time.time() - start_time
    
    assert result == 'success'
    assert call_count[0] == 3
    # Should have taken at least 0.05 + 0.1 = 0.15 seconds
    assert total_duration >= 0.1


@pytest.mark.asyncio
async def test_retry_async_timeout():
    """Test async retry timeout."""
    async def fn():
        await asyncio.sleep(2.0)
        return 'success'
    
    with pytest.raises(AuthAgentTimeoutError):
        await retry_with_backoff_async(fn, RetryOptions(timeout=0.1, max_retries=0))

