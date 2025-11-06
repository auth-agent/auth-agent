"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag } from "lucide-react"
import { AuthAgentButton } from "@/components/auth-agent-button"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <ShoppingBag className="h-10 w-10 text-primary" />
          <span className="text-3xl font-bold text-foreground">ShopHub</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in with Auth Agent to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AuthAgentButton />
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">
              Sign in using Auth Agent OAuth 2.1
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
