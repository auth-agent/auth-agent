"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { PortfolioCard } from "@/components/portfolio-card"
import { MarketOverview } from "@/components/market-overview"
import { TradingChart } from "@/components/trading-chart"
import { RecentTransactions } from "@/components/recent-transactions"
import { WatchList } from "@/components/watch-list"

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return
    }

    // Check authentication from localStorage
    const session = localStorage.getItem('auth_agent_session')
    if (session) {
      try {
        const sessionData = JSON.parse(session)
        // Check if token is expired
        if (sessionData.expiresAt && Date.now() < sessionData.expiresAt) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('auth_agent_session')
          router.push('/')
        }
      } catch {
        localStorage.removeItem('auth_agent_session')
        router.push('/')
      }
    } else {
      router.push('/')
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
    <div className="min-h-screen bg-background dark">
      <DashboardHeader />

      <main className="container mx-auto p-6 space-y-6">
        {/* Portfolio Overview */}
        <PortfolioCard />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trading Chart - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <TradingChart />
          </div>

          {/* Watch List */}
          <div>
            <WatchList />
          </div>
        </div>

        {/* Market Overview and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MarketOverview />
          <RecentTransactions />
        </div>
      </main>
    </div>
  )
}
