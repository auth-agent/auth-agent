"""
Auth Agent SDK - Official Python SDK for Auth Agent OAuth 2.1
Supports both website backends and AI agent authentication
"""

from setuptools import setup, find_packages
from pathlib import Path

# Read README
readme_file = Path(__file__).parent / "PYPI_README.md"
long_description = readme_file.read_text(encoding="utf-8") if readme_file.exists() else ""

setup(
    name="auth-agent-sdk",
    version="0.0.2",
    description="Official Python SDK for Auth Agent - OAuth 2.1 authentication for websites and AI agents. Includes client SDK for Python backends (Flask/FastAPI) and agent SDK for browser automation with browser-use integration.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Auth Agent Team",
    author_email="sdk@auth-agent.com",
    url="https://github.com/auth-agent/auth-agent",
    project_urls={
        "Documentation": "https://docs.auth-agent.com",
        "Source": "https://github.com/auth-agent/auth-agent",
        "Tracker": "https://github.com/auth-agent/auth-agent/issues",
    },
    packages=find_packages(where="python"),
    package_dir={"": "python"},
    python_requires=">=3.8",
    install_requires=[
        "aiohttp>=3.8.0",
        "typing-extensions>=4.0.0; python_version<'3.11'",
        "browser-use>=0.1.0",
        "playwright>=1.40.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "black>=23.0.0",
            "mypy>=1.0.0",
        ],
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Security",
    ],
    keywords=[
        "auth",
        "oauth",
        "oauth2",
        "authentication",
        "ai-agent",
        "pkce",
        "oidc",
        "auth-agent",
        "browser-use",
    ],
    license="MIT",
    include_package_data=True,
)
