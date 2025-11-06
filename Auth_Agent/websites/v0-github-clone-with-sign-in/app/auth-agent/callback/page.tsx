"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthAgentClient } from "@/lib/auth-agent-sdk"

export default function AuthAgentCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "error">("loading")

  useEffect(() => {
    async function handleCallback() {
      try {
        const client = new AuthAgentClient({
          authServerUrl: process.env.NEXT_PUBLIC_AUTH_AGENT_SERVER_URL || 'https://api.auth-agent.com',
          clientId: process.env.NEXT_PUBLIC_AUTH_AGENT_CLIENT_ID || '',
          redirectUri: `${window.location.origin}/auth-agent/callback`,
        })

        const callbackData = client.handleCallback()
        if (!callbackData) {
          setStatus("error")
          return
        }

        // Exchange code for tokens
        const response = await fetch('/api/auth-agent/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: callbackData.code,
            code_verifier: callbackData.codeVerifier,
          }),
        })

        if (!response.ok) {
          setStatus("error")
          return
        }

        const data = await response.json()

        // Store session in localStorage (for demo - no DB)
        localStorage.setItem('auth_agent_session', JSON.stringify({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          agentId: data.agent_id,
          model: data.model,
          expiresAt: Date.now() + data.expires_in * 1000,
        }))

        router.push('/dashboard')
      } catch (error) {
        console.error('Callback error:', error)
        setStatus("error")
      }
    }

    handleCallback()
  }, [router])

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
          <p className="text-muted-foreground mb-4">Failed to complete authentication.</p>
          <button
            onClick={() => router.push('/signin')}
            className="text-primary hover:underline"
          >
            Return to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  )
}


