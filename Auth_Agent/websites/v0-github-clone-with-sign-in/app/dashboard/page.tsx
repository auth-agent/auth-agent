"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { RepositoryList } from "@/components/repository-list"
import { ActivityFeed } from "@/components/activity-feed"

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = localStorage.getItem('auth_agent_session')
    if (session) {
      try {
        const sessionData = JSON.parse(session)
        if (sessionData.expiresAt && Date.now() < sessionData.expiresAt) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('auth_agent_session')
          router.push('/signin')
        }
      } catch {
        localStorage.removeItem('auth_agent_session')
        router.push('/signin')
      }
    } else {
      router.push('/signin')
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="flex">
        <DashboardSidebar />

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RepositoryList />
              </div>

              <div>
                <ActivityFeed />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
