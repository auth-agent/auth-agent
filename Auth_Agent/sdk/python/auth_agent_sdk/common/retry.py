"""
Retry logic with exponential backoff
"""

import time
import asyncio
from typing import Callable, TypeVar, Optional, List
from .errors import AuthAgentNetworkError, AuthAgentTimeoutError

T = TypeVar('T')


class RetryOptions:
    """Options for retry logic."""
    
    def __init__(
        self,
        max_retries: int = 3,
        initial_delay: float = 1.0,
        max_delay: float = 10.0,
        backoff_multiplier: float = 2.0,
        retryable_status_codes: Optional[List[int]] = None,
        timeout: float = 30.0,
    ):
        self.max_retries = max_retries
        self.initial_delay = initial_delay
        self.max_delay = max_delay
        self.backoff_multiplier = backoff_multiplier
        self.retryable_status_codes = retryable_status_codes or [408, 429, 500, 502, 503, 504]
        self.timeout = timeout


def is_retryable_error(error: Exception, retryable_status_codes: List[int]) -> bool:
    """Check if error is retryable."""
    # Network errors are always retryable
    if isinstance(error, (ConnectionError, TimeoutError)):
        return True
    
    # Check status codes
    if hasattr(error, 'status_code') and error.status_code in retryable_status_codes:
        return True
    
    # Timeout errors are retryable
    if isinstance(error, AuthAgentTimeoutError):
        return True
    
    return False


def retry_with_backoff(
    fn: Callable[[], T],
    options: Optional[RetryOptions] = None
) -> T:
    """
    Retry a function with exponential backoff (sync version).
    
    Args:
        fn: Function to retry
        options: Retry options
        
    Returns:
        Result of the function
        
    Raises:
        AuthAgentNetworkError: If all retries fail
        AuthAgentTimeoutError: If request times out
    """
    opts = options or RetryOptions()
    last_error = None
    delay = opts.initial_delay
    
    for attempt in range(opts.max_retries + 1):
        try:
            # Create timeout
            start_time = time.time()
            result = fn()
            
            # Check if we exceeded timeout (for sync functions, this is approximate)
            if time.time() - start_time > opts.timeout:
                raise AuthAgentTimeoutError(f"Request timeout after {opts.timeout}s")
            
            return result
        except Exception as error:
            last_error = error
            
            # Don't retry on last attempt
            if attempt >= opts.max_retries:
                break
            
            # Don't retry if error is not retryable
            if not is_retryable_error(error, opts.retryable_status_codes):
                raise error
            
            # Wait before retrying with exponential backoff
            time.sleep(min(delay, opts.max_delay))
            delay *= opts.backoff_multiplier
    
    # If we get here, all retries failed
    if isinstance(last_error, AuthAgentTimeoutError):
        raise last_error
    
    raise AuthAgentNetworkError(
        f"Request failed after {opts.max_retries + 1} attempts: {str(last_error)}",
        last_error
    )


async def retry_with_backoff_async(
    fn: Callable[[], T],
    options: Optional[RetryOptions] = None
) -> T:
    """
    Retry an async function with exponential backoff (async version).
    
    Args:
        fn: Async function (coroutine) to retry
        options: Retry options
        
    Returns:
        Result of the function
        
    Raises:
        AuthAgentNetworkError: If all retries fail
        AuthAgentTimeoutError: If request times out
    """
    opts = options or RetryOptions()
    last_error = None
    delay = opts.initial_delay
    
    for attempt in range(opts.max_retries + 1):
        try:
            # Create timeout - fn() returns a coroutine, await it with timeout
            result = await asyncio.wait_for(fn(), timeout=opts.timeout)
            return result
        except asyncio.TimeoutError:
            raise AuthAgentTimeoutError(f"Request timeout after {opts.timeout}s")
        except Exception as error:
            last_error = error
            
            # Don't retry on last attempt
            if attempt >= opts.max_retries:
                break
            
            # Don't retry if error is not retryable
            if not is_retryable_error(error, opts.retryable_status_codes):
                raise error
            
            # Wait before retrying with exponential backoff
            await asyncio.sleep(min(delay, opts.max_delay))
            delay *= opts.backoff_multiplier
    
    # If we get here, all retries failed
    if isinstance(last_error, AuthAgentTimeoutError):
        raise last_error
    
    raise AuthAgentNetworkError(
        f"Request failed after {opts.max_retries + 1} attempts: {str(last_error)}",
        last_error
    )

