"""
Pytest configuration and fixtures
"""

import pytest
import sys
from pathlib import Path

# Add the SDK to the path
sdk_path = Path(__file__).parent.parent / "auth_agent_sdk"
sys.path.insert(0, str(sdk_path.parent))



