"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [hasAuthAgentSession, setHasAuthAgentSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    // Check for Auth Agent session first
    const session = localStorage.getItem('auth_agent_session')
    if (session) {
      try {
        const sessionData = JSON.parse(session)
        if (sessionData.expiresAt && Date.now() < sessionData.expiresAt) {
          setHasAuthAgentSession(true)
          setCheckingSession(false)
          return
        } else {
          localStorage.removeItem('auth_agent_session')
        }
      } catch {
        localStorage.removeItem('auth_agent_session')
      }
    }
    setCheckingSession(false)
  }, [])

  useEffect(() => {
    // Only redirect if we're done checking and there's no auth (either Supabase or Auth Agent)
    if (!checkingSession && !loading && !user && !hasAuthAgentSession) {
      router.push("/sign-in")
    }
  }, [user, loading, router, hasAuthAgentSession, checkingSession])

  if (loading || checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user && !hasAuthAgentSession) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <div className="lg:pl-64">
        <DashboardHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
