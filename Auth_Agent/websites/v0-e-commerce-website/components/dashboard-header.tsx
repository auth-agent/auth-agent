"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"

export function DashboardHeader() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [authAgentSession, setAuthAgentSession] = useState<any>(null)

  useEffect(() => {
    const session = localStorage.getItem('auth_agent_session')
    if (session) {
      try {
        const sessionData = JSON.parse(session)
        if (sessionData.expiresAt && Date.now() < sessionData.expiresAt) {
          setAuthAgentSession(sessionData)
        }
      } catch {
        // Invalid session
      }
    }
  }, [])

  const handleSignOut = () => {
    if (authAgentSession) {
      localStorage.removeItem('auth_agent_session')
      router.push("/")
    } else {
      signOut()
      router.push("/")
    }
  }

  const displayName = user?.name || (authAgentSession?.agentId ? `Agent ${authAgentSession.agentId.substring(0, 8)}` : "User")
  const displayEmail = user?.email || (authAgentSession?.model ? `Model: ${authAgentSession.model}` : "")
  
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : authAgentSession?.agentId
      ? authAgentSession.agentId.substring(0, 2).toUpperCase()
      : "U"

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{displayEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
