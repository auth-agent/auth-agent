"""
Auth Agent SDK - Official Python SDK for Auth Agent OAuth 2.1

This package provides SDKs for both websites and AI agents:
- client: OAuth 2.1 client for website backends
- agent: SDK for AI agents to authenticate programmatically
"""

__version__ = "0.0.2"
__author__ = "Auth Agent Team"
__license__ = "MIT"

# Re-export main classes for convenience
from .client import AuthAgentClient
from .agent import AuthAgentSDK

__all__ = [
    "AuthAgentClient",
    "AuthAgentSDK",
]
