"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthAgentButton } from "@/components/auth-agent-button"

export function SignInForm() {
  return (
    <Card className="w-full max-w-md border-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-foreground">Welcome back</CardTitle>
        <CardDescription className="text-muted-foreground">
          Sign in with Auth Agent to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AuthAgentButton />
        </div>
      </CardContent>
    </Card>
  )
}
