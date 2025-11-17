'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

// Google One-Tap TypeScript declarations
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: () => void
          renderButton: (element: HTMLElement, config: any) => void
        }
      }
    }
  }
}

type AuthView = 'sign_up' | 'sign_in' | 'forgot_password' | 'email_sent'

interface AuthFormProps {
  view?: AuthView
}

export default function AuthForm({ view = 'sign_up' }: AuthFormProps) {
  const [currentView, setCurrentView] = useState<AuthView>(view)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null)
  const [showManualSignIn, setShowManualSignIn] = useState(false)

  // Auto-initialize Google Sign-In when component mounts
  useEffect(() => {
    // Check if user is already signed in first
    const checkUser = async () => {
      if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        window.location.href = '/dashboard'
        return
      }
      if (currentView !== 'forgot_password' && currentView !== 'email_sent') {
        handleGoogleSignIn()
      }
    }
    checkUser()
  }, [currentView])

  // NEW: Always re-initialize Google sign-in on mount
  useEffect(() => {
    if (currentView !== 'forgot_password' && currentView !== 'email_sent') {
      handleGoogleSignIn()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!supabase) {
    return (
      <div className="w-full max-w-md mx-auto p-4 text-center text-red-600">
        Supabase configuration is missing. Please check your environment variables.
      </div>
    )
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    if (!email || !password || !fullName) {
      setMessage({type: 'error', text: 'Please fill in all fields'})
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // First, check if user already exists by attempting to sign in
      const { data: existingUser, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy-password' // Use dummy password to check if email exists
      })

      // If we get an "Invalid login credentials" error, the email might exist but password is wrong
      // If we get "Email not confirmed" error, the user definitely exists
      if (signInError && 
          (signInError.message.includes('Invalid login credentials') || 
           signInError.message.includes('Email not confirmed'))) {
        // User exists! Switch to sign-in view
        setCurrentView('sign_in')
        setPassword('') // Clear password for security
        setMessage({
          type: 'success', 
          text: 'Found your account! Please sign in with your password.'
        })
        return
      }

      // If no existing user found, proceed with signup
      // Generate username from full name
      const username = fullName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      })

      if (error) throw error

      if (data.user && !data.session) {
        setMessage({
          type: 'success', 
          text: `Verification email sent to ${email}. Check your inbox (and spam folder) for the confirmation link.`
        })
        setCurrentView('email_sent')
      } else if (data.user && data.session) {
        // User is immediately signed in (email confirmation disabled)
        setMessage({type: 'success', text: 'Account created successfully! Redirecting...'})
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 800)
      }
    } catch (error: any) {
      console.log('Signup error:', error.message) // Debug log
      
      // Check for various existing user error messages
      if (error.message.includes('User already registered') || 
          error.message.includes('already registered') ||
          error.message.includes('already exists') ||
          error.message.includes('duplicate') ||
          error.code === 'user_already_exists') {
        // Automatically switch to sign-in view for better UX
        setCurrentView('sign_in')
        setPassword('') // Clear password for security
        setMessage({
          type: 'success', 
          text: 'Found your account! Please sign in with your password.'
        })
      } else if (error.message.includes('Password should be at least 6 characters')) {
        setMessage({type: 'error', text: 'Password must be at least 6 characters long.'})
      } else {
        setMessage({type: 'error', text: `Signup failed: ${error.message}`})
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      setMessage({type: 'error', text: 'Supabase client not available'})
      return
    }
    if (!email || !password) {
      setMessage({type: 'error', text: 'Please fill in all fields'})
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw error
      }
      
      if (data.user) {
        // Check if email is confirmed using Supabase's built-in verification
        if (!data.user.email_confirmed_at) {
          setMessage({
            type: 'error', 
            text: 'Please verify your email address before signing in. Check your inbox for the confirmation link.'
          })
          return
        }
        
        setMessage({type: 'success', text: 'Signed in successfully! Redirecting...'})
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 800)
      } else {
        setMessage({type: 'error', text: 'No user data returned'})
      }
    } catch (error: any) {
      if (error.message.includes('Invalid login credentials')) {
        setMessage({type: 'error', text: 'Invalid email or password. Please check your credentials and try again.'})
      } else if (error.message.includes('Email not confirmed')) {
        setMessage({
          type: 'error', 
          text: 'Please verify your email address before signing in. Check your inbox for the confirmation link.'
        })
      } else {
        setMessage({type: 'error', text: error.message || 'Sign in failed'})
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    if (!email) {
      setMessage({type: 'error', text: 'Please enter your email address'})
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) throw error

      setMessage({type: 'success', text: 'Password reset link sent to your email!'})
      setCurrentView('email_sent')
    } catch (error: any) {
      setMessage({type: 'error', text: error.message})
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!supabase) {
      setMessage({type: 'error', text: 'Supabase client not available'})
      return
    }
    
    setLoading(true)
    setMessage(null)

    try {
      // Use Google's direct sign-in instead of OAuth redirect
      // This loads Google's cleaner sign-in widget
      if (!window.google?.accounts?.id) {
        // Load Google script if not already loaded
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        document.head.appendChild(script)
        
        script.onload = () => {
          initGoogleSignIn()
        }
      } else {
        initGoogleSignIn()
      }
    } catch (error: any) {
      setMessage({type: 'error', text: error.message || 'Google sign in failed'})
      setLoading(false)
    }
  }

  const initGoogleSignIn = () => {
    if (!window.google?.accounts?.id) {
      setMessage({type: 'error', text: 'Google API not loaded properly'})
      setLoading(false)
      return
    }
    try {
      window.google.accounts.id.initialize({
        client_id: '520840999198-m0v3cj6cuft3n6fc3v2jb41cdier3rrh.apps.googleusercontent.com',
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      })
      // Use renderButton instead of prompt for more reliable sign-in
      const googleButton = document.getElementById('google-signin-button')
      if (googleButton) {
        // Clear previous button if any
        googleButton.innerHTML = ''
        setTimeout(() => {
          const containerWidth = googleButton.parentElement?.offsetWidth || 400
          if (window.google?.accounts?.id) {
            window.google.accounts.id.renderButton(googleButton, {
              theme: 'outline',
              size: 'large',
              width: Math.max(containerWidth, 200),
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left'
            })
          }
        }, 100)
      }
      setLoading(false)
    } catch (error: any) {
      setMessage({type: 'error', text: 'Failed to initialize Google Sign-In'})
      setLoading(false)
    }
  }

  const handleGoogleCredential = async (response: any) => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      })

      if (error) throw error

      if (data.user) {
        setMessage({type: 'success', text: 'Signed in successfully! Redirecting...'})
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 800)
      }
    } catch (error: any) {
      setMessage({type: 'error', text: error.message || 'Google sign in failed'})
    } finally {
      setLoading(false)
    }
  }

  const renderForm = () => {
    if (currentView === 'sign_up' && !showManualSignIn) {
      return (
        <div className="space-y-6">
          {/* Google Sign-In Button Container */}
          <div className="w-full">
            <div 
              id="google-signin-button" 
              className="w-full min-w-0"
              style={{ width: '100%', minWidth: '200px' }}
            ></div>
          </div>
        </div>
      )
    }

    switch (currentView) {
      case 'sign_up':
        if (showManualSignIn) {
          return (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowManualSignIn(false)}
                className="text-blue-600 hover:text-blue-700 text-sm mb-4"
              >
                ← Back to Google sign-in
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('sign_in')}
                className="btn-primary w-full"
              >
                Sign in with existing account
              </button>
            </div>
          )
        }
        return null

             case 'sign_in':
         return (
           <form onSubmit={handleSignIn} className="space-y-4">
             <div>
               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                 Email
               </label>
               <input
                 id="email"
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="input-enhanced"
                 placeholder="Enter your email"
                 required
               />
             </div>

             <div>
               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                 Password
               </label>
               <div className="relative">
                 <input
                   id="password"
                   type={showPassword ? 'text' : 'password'}
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="input-enhanced pr-10"
                   placeholder="Enter your password"
                   required
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                 >
                   {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                 </button>
               </div>
             </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setCurrentView('forgot_password')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        )

             case 'forgot_password':
         return (
           <form onSubmit={handleForgotPassword} className="space-y-4">
             <div>
               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                 Email
               </label>
               <input
                 id="email"
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="input-enhanced"
                 placeholder="Enter your email"
                 required
               />
             </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Sending reset link...
                </>
              ) : (
                'Send reset link'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setCurrentView('sign_in')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Back to sign in
              </button>
            </div>
          </form>
        )

                     case 'email_sent':
        return (
          <div className="text-center py-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h3>
            <p className="text-gray-600 mb-4">
              We've sent you a verification link at <strong>{email}</strong>
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-medium text-blue-900 mb-2">📧 Email not arriving?</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Check your <strong>spam/junk folder</strong></li>
                <li>• Refresh your email in a minute</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => setCurrentView('sign_in')}
                className="btn-primary w-full"
              >
                Try signing in instead
              </button>
              <button
                onClick={() => setCurrentView('sign_up')}
                className="btn-secondary w-full"
              >
                Back to sign up
              </button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      {currentView !== 'email_sent' && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentView === 'sign_up' && !showManualSignIn && 'Create your account'}
            {currentView === 'sign_up' && showManualSignIn && 'Sign in to existing account'}
            {currentView === 'sign_in' && 'Welcome back'}
            {currentView === 'forgot_password' && 'Reset your password'}
          </h2>
          <p className="text-gray-600 mt-2">
            {currentView === 'sign_up' && !showManualSignIn && 'Get your link in 2 minutes with Google'}
            {currentView === 'sign_up' && showManualSignIn && 'For existing email/password accounts'}
            {currentView === 'sign_in' && 'Sign in to your account'}
            {currentView === 'forgot_password' && 'Enter your email to reset your password'}
          </p>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center ${
          message.type === 'error' 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message.type === 'error' ? (
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}



      {/* Form */}
      {renderForm()}

      {/* Toggle */}
      {currentView === 'sign_in' && (
        <div className="text-center mt-6 text-sm">
          <p className="text-gray-600 mb-2">New to Profilio?</p>
          <button
            onClick={() => {
              setCurrentView('sign_up')
              setShowManualSignIn(false)
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create account with Google
          </button>
        </div>
      )}
    </div>
  )
} 