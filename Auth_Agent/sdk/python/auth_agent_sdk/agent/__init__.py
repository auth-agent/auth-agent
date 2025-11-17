"""
Auth Agent SDK - For AI agents

SDK for AI agents to authenticate programmatically on websites using Auth Agent.
Includes browser-use integration for seamless browser automation.
"""

from .auth_agent_agent_sdk import AuthAgentSDK

# Browser-use integration (optional, requires browser-use package)
try:
    from .browser_use import AuthAgentTools
    __all__ = ["AuthAgentSDK", "AuthAgentTools"]
except ImportError:
    # browser-use not installed, only export SDK
    __all__ = ["AuthAgentSDK"]
