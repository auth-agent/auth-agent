"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AuthAgentClient } from "@/lib/auth-agent-sdk"

interface AuthAgentButtonProps {
  className?: string
}

export function AuthAgentButton({ className }: AuthAgentButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    try {
      setLoading(true)

      const client = new AuthAgentClient({
        authServerUrl: process.env.NEXT_PUBLIC_AUTH_AGENT_SERVER_URL || 'https://api.auth-agent.com',
        clientId: process.env.NEXT_PUBLIC_AUTH_AGENT_CLIENT_ID || '',
        redirectUri: `${window.location.origin}/auth-agent/callback`,
      })

      await client.signIn()
    } catch (error) {
      setLoading(false)
      console.error('Auth Agent sign in error:', error)
    }
  }

  return (
    <Button
      onClick={handleSignIn}
      disabled={loading}
      className={`w-full bg-[#FF6B35] hover:bg-[#FF5722] text-white ${className}`}
      style={{
        boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)',
      }}
    >
      {loading ? "Signing in..." : "Sign in with Auth Agent"}
    </Button>
  )
}


