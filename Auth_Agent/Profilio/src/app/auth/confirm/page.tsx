'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

function ConfirmEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const confirmEmail = async () => {
      if (!supabase) {
        setStatus('error')
        setMessage('Authentication service unavailable')
        return
      }

      try {
        // Get URL parameters for confirmation
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')
        const code = searchParams.get('code')

        console.log('URL params:', { token_hash, type, code, searchParams: searchParams.toString() })

        let result

        // Handle different confirmation methods
        if (code) {
          // New method using authorization code
          result = await supabase.auth.exchangeCodeForSession(code)
        } else if (token_hash && type) {
          // Legacy method using token hash
          result = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any
          })
        } else {
          setStatus('error')
          setMessage('Invalid confirmation link - missing required parameters')
          return
        }

        if (result?.error) {
          throw result.error
        }

        if (result?.data?.user) {
          setStatus('success')
          setMessage('Email confirmed successfully!')
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Email confirmation failed - no user data')
        }

      } catch (error: any) {
        console.error('Email confirmation error:', error)
        setStatus('error')
        setMessage(error.message || 'Email confirmation failed')
      }
    }

    confirmEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="text-center py-12">
          {status === 'loading' && (
            <>
              <Loader2 className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirming your email</h1>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Email confirmed!</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500">Redirecting you to your dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirmation failed</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <Link 
                  href="/auth" 
                  className="btn-primary inline-flex"
                >
                  Try signing in
                </Link>
                <div>
                  <Link 
                    href="/auth" 
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Request new confirmation email
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto px-6 py-8">
          <div className="text-center py-12">
            <Loader2 className="animate-spin h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading</h1>
            <p className="text-gray-600">Please wait...</p>
          </div>
        </div>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  )
} 