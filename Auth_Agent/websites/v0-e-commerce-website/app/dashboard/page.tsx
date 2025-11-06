"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react"

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
          router.push('/sign-in')
        }
      } catch {
        localStorage.removeItem('auth_agent_session')
        router.push('/sign-in')
      }
    } else {
      router.push('/sign-in')
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

  // Mock data
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1% from last month",
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: "2,350",
      change: "+180 from last month",
      icon: ShoppingCart,
    },
    {
      title: "Products",
      value: "156",
      change: "+12 new this month",
      icon: Package,
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      change: "+0.5% from last month",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Overview</h2>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your store today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: "#3210", customer: "John Doe", amount: "$250.00", status: "Completed" },
                { id: "#3209", customer: "Jane Smith", amount: "$150.00", status: "Processing" },
                { id: "#3208", customer: "Bob Johnson", amount: "$350.00", status: "Completed" },
                { id: "#3207", customer: "Alice Brown", amount: "$120.00", status: "Pending" },
              ].map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-foreground">{order.amount}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === "Completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : order.status === "Processing"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Wireless Headphones", sales: 234, revenue: "$11,700" },
                { name: "Smart Watch", sales: 189, revenue: "$9,450" },
                { name: "Laptop Stand", sales: 156, revenue: "$4,680" },
                { name: "USB-C Cable", sales: 142, revenue: "$2,130" },
              ].map((product) => (
                <div key={product.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{product.name}</p>
                    <span className="text-sm font-medium text-foreground">{product.revenue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(product.sales / 234) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{product.sales} sales</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
