"""
Test script: Authenticate with E-commerce website using Auth Agent (localhost).

This script tests the Auth Agent OAuth 2.1 flow on the e-commerce demo website running locally.
Make sure the website is running on http://localhost:3000 before running this script.
"""

import os
import sys
import asyncio
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add the examples directory to the path for imports
examples_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, examples_dir)

# Import the Auth Agent tools
from auth_agent_authenticate import AuthAgentTools

# Import browser-use
from browser_use import Agent, ChatBrowserUse


async def main():
    """Run the Auth Agent authentication test for E-commerce website."""
    
    # Initialize LLM
    llm = ChatBrowserUse()
    
    # Initialize Auth Agent tools with credentials from environment
    tools = AuthAgentTools(
        agent_id=os.getenv('AGENT_ID'),
        agent_secret=os.getenv('AGENT_SECRET'),
        model=os.getenv('AGENT_MODEL', 'browser-use'),
    )
    
    # Create the task for E-commerce website (localhost)
    task = (
        "Go to http://localhost:3000/sign-in "
        "and click on the 'Sign in with Auth Agent' button. "
        "When the spinning authentication page appears (shows 'Authenticating AI Agent' with a spinner), "
        "use the authenticate_with_auth_agent tool to complete the authentication. "
        "Wait for the page to redirect after authentication succeeds. "
        "Keep waiting until you reach the dashboard page - do not stop until you see the dashboard. "
        "The dashboard should show e-commerce data like orders, products, revenue, or sales information. "
        "Only use the 'done' tool when you have successfully reached and verified you are on the dashboard page."
    )
    
    # Create and run the agent
    agent = Agent(
        task=task,
        llm=llm,
        tools=tools,  # Pass the Tools instance directly
    )
    
    # Run the agent
    print("🚀 Starting authentication test for E-commerce website (localhost)...\n")
    print("⚠️  Make sure the website is running on http://localhost:3000\n")
    history = await agent.run()
    
    # Print the result
    print("\n" + "="*60)
    print("Authentication Complete!")
    print("="*60)
    print("\nFinal result:")
    if hasattr(history, 'final_result'):
        print(history.final_result())
    else:
        print(history)
    
    return history


if __name__ == "__main__":
    asyncio.run(main())


