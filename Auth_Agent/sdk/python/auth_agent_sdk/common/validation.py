"""
URL validation and SSRF protection utilities
"""

from urllib.parse import urlparse
from typing import Optional, List
from .errors import AuthAgentValidationError, AuthAgentSecurityError


def validate_url(url: str, allowed_hosts: Optional[List[str]] = None) -> urlparse:
    """
    Validate URL format and prevent SSRF attacks.
    
    Args:
        url: URL to validate
        allowed_hosts: Optional whitelist of allowed hosts
        
    Returns:
        Parsed URL object
        
    Raises:
        AuthAgentSecurityError: If URL is blocked for security reasons
        AuthAgentValidationError: If URL format is invalid
    """
    try:
        parsed = urlparse(url)
        
        # Only allow http and https
        if parsed.scheme not in ('http', 'https'):
            raise AuthAgentSecurityError(
                f"Invalid protocol: {parsed.scheme}. Only http and https are allowed."
            )
        
        # Block private/internal IPs and localhost (SSRF protection)
        hostname = parsed.hostname.lower() if parsed.hostname else ''
        
        # Check for localhost
        if hostname in ('localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]'):
            raise AuthAgentSecurityError(
                f"SSRF protection: Blocked access to localhost/internal hostname: {hostname}"
            )
        
        # Check for private IP ranges
        if hostname:
            parts = hostname.split('.')
            if len(parts) == 4:
                try:
                    # IPv4 address
                    octets = [int(p) for p in parts]
                    
                    # Check for private ranges
                    # 192.168.0.0/16
                    if octets[0] == 192 and octets[1] == 168:
                        raise AuthAgentSecurityError(
                            f"SSRF protection: Blocked access to private IP range: {hostname}"
                        )
                    # 10.0.0.0/8
                    if octets[0] == 10:
                        raise AuthAgentSecurityError(
                            f"SSRF protection: Blocked access to private IP range: {hostname}"
                        )
                    # 172.16.0.0/12
                    if octets[0] == 172 and 16 <= octets[1] <= 31:
                        raise AuthAgentSecurityError(
                            f"SSRF protection: Blocked access to private IP range: {hostname}"
                        )
                except ValueError:
                    # Not an IP address, continue
                    pass
            
            # Check for .local and .internal domains
            if hostname.endswith('.local') or hostname.endswith('.internal'):
                raise AuthAgentSecurityError(
                    f"SSRF protection: Blocked access to internal domain: {hostname}"
                )
        
        # If allowedHosts is provided, check against whitelist
        if allowed_hosts and len(allowed_hosts) > 0:
            is_allowed = False
            for allowed in allowed_hosts:
                allowed_lower = allowed.lower()
                if hostname == allowed_lower or hostname.endswith('.' + allowed_lower):
                    is_allowed = True
                    break
            
            if not is_allowed:
                raise AuthAgentSecurityError(
                    f"Hostname {hostname} is not in the allowed hosts list"
                )
        
        return parsed
    except (AuthAgentSecurityError, AuthAgentValidationError):
        raise
    except Exception as e:
        raise AuthAgentValidationError(f"Invalid URL format: {url}") from e


def validate_redirect_uri(redirect_uri: str) -> None:
    """
    Validate redirect URI format.
    
    Args:
        redirect_uri: Redirect URI to validate
        
    Raises:
        AuthAgentValidationError: If redirect URI is invalid
    """
    try:
        parsed = urlparse(redirect_uri)
        
        # Only allow http and https
        if parsed.scheme not in ('http', 'https'):
            raise AuthAgentValidationError(
                f"Redirect URI must use http or https protocol, got: {parsed.scheme}"
            )
        
        # In production, should require https (except localhost)
        hostname = parsed.hostname.lower() if parsed.hostname else ''
        if parsed.scheme == 'http' and 'localhost' not in hostname and '127.0.0.1' not in hostname:
            raise AuthAgentValidationError(
                'Redirect URI must use https in production (http only allowed for localhost)'
            )
    except AuthAgentValidationError:
        raise
    except Exception as e:
        raise AuthAgentValidationError(f"Invalid redirect URI format: {redirect_uri}") from e



