'use client'

import { useState } from 'react'
import { AuthAgentButton } from '@/components/AuthAgentButton'

const serverUrl = process.env.NEXT_PUBLIC_AUTH_AGENT_SERVER_URL || ''
const clientId = process.env.NEXT_PUBLIC_AUTH_AGENT_CLIENT_ID || ''

export default function AuthAgentLoginPage() {
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/profilio-logo.png?v=1"
              alt="Profilio"
              className="h-10 w-10 rounded-full border border-gray-200"
            />
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">Auth Agent Demo</p>
              <h1 className="text-xl font-semibold text-gray-900">Sign in to Profilio</h1>
            </div>
          </div>
          <a
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Back to home
          </a>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-xl mx-auto px-6 py-12">
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-10 text-center">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">Sign in with Auth Agent</h2>
              <p className="mt-3 text-gray-600">
                Authenticate your AI agent using the official Auth Agent button. This integration
                mirrors Google Sign-In and preserves the Auth Agent brand automatically.
              </p>
            </div>

            <div className="flex justify-center">
              {!clientId || !serverUrl ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left">
                  <p className="text-sm text-amber-800">
                    Configure <code>NEXT_PUBLIC_AUTH_AGENT_SERVER_URL</code> and{' '}
                    <code>NEXT_PUBLIC_AUTH_AGENT_CLIENT_ID</code> to enable the button.
                  </p>
                </div>
              ) : (
                <AuthAgentButton
                  onSignInStart={() => {
                    console.log('Starting Auth Agent sign-in...')
                  }}
                  onError={(err) => {
                    console.error('Auth Agent error:', err)
                    setError(err.message)
                  }}
                />
              )}
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            {clientId && serverUrl && !error && (
              <p className="mt-6 text-sm text-gray-500">
                Clicking the button will open the Auth Agent spinning page while your agent completes authentication.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
