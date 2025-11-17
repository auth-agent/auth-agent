import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'auth-agent-session'

// Disable Next.js CSRF protection for this route
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function POST(request: NextRequest) {
  try {
    console.log('[Exchange API] Request received:', {
      method: request.method,
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      url: request.url,
    })

    const { code, code_verifier } = await request.json()

    if (!code || !code_verifier) {
      return NextResponse.json(
        {
          error: 'invalid_request',
          error_description: 'Missing authorization code or code_verifier'
        },
        { status: 400 }
      )
    }

    const serverUrl = (process.env.AUTH_AGENT_SERVER_URL || '').replace(/\/+$/, '')
    const clientId = process.env.AUTH_AGENT_CLIENT_ID
    const clientSecret = process.env.AUTH_AGENT_CLIENT_SECRET
    const redirectUri = `${request.nextUrl.origin}/ai-auth/callback`

    console.log('Exchange route called:', {
      hasServerUrl: !!serverUrl,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      redirectUri,
      codePrefix: code.substring(0, 20),
    })

    if (!serverUrl || !clientId || !clientSecret) {
      return NextResponse.json(
        {
          error: 'server_error',
          error_description: 'Auth Agent server configuration is missing'
        },
        { status: 500 }
      )
    }

    // Exchange authorization code for tokens
    const fetchHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Origin': request.nextUrl.origin,
      'Referer': `${request.nextUrl.origin}/ai-auth/callback`,
    }
    
    console.log('[Exchange API] Fetching token with headers:', {
      url: `${serverUrl}/token`,
      headers: fetchHeaders,
    })
    
    const tokenResponse = await fetch(`${serverUrl}/token`, {
      method: 'POST',
      headers: fetchHeaders,
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        code_verifier,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })

    if (!tokenResponse.ok) {
      const responseText = await tokenResponse.text()
      let error = {}
      try {
        error = JSON.parse(responseText)
      } catch (e) {
        console.error('Token exchange failed - non-JSON response:', {
          status: tokenResponse.status,
          responseText: responseText.substring(0, 500),
          headers: Object.fromEntries(tokenResponse.headers.entries()),
        })
      }
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        error,
        code: code.substring(0, 20) + '...',
        redirectUri,
      })
      return NextResponse.json(
        {
          error: (error as any).error || 'invalid_grant',
          error_description: (error as any).error_description || 'Token exchange failed',
        },
        { status: tokenResponse.status }
      )
    }

    const tokens = await tokenResponse.json()

    // Introspect the access token to get agent info
    const introspectResponse = await fetch(`${serverUrl}/introspect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': request.nextUrl.origin,
        'Referer': `${request.nextUrl.origin}/ai-auth/callback`,
      },
      body: JSON.stringify({
        token: tokens.access_token,
        token_type_hint: 'access_token',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })

    if (!introspectResponse.ok) {
      return NextResponse.json(
        {
          error: 'server_error',
          error_description: 'Failed to introspect access token'
        },
        { status: 500 }
      )
    }

    const introspectData = await introspectResponse.json()

    if (!introspectData.active) {
      return NextResponse.json(
        {
          error: 'invalid_token',
          error_description: 'Access token is not active'
        },
        { status: 401 }
      )
    }

    // Get user email from /userinfo endpoint for user matching
    let userEmail: string | null = null
    let linkedUserId: string | null = null

    try {
      const userInfoResponse = await fetch(`${serverUrl}/userinfo`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
      })

      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json()
        userEmail = userInfo.email || null

        // Find or create user account by email
        if (userEmail) {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

          if (supabaseUrl && supabaseServiceKey) {
            const { createClient } = await import('@supabase/supabase-js')
            const supabase = createClient(supabaseUrl, supabaseServiceKey, {
              auth: {
                autoRefreshToken: false,
                persistSession: false
              }
            })

            // Find existing user by email
            const { data: existingUsers } = await supabase.auth.admin.listUsers()
            const existingUser = existingUsers?.users?.find(u => u.email === userEmail)

            if (existingUser) {
              linkedUserId = existingUser.id
              console.log('[Exchange API] Found existing user by email:', { email: userEmail, userId: linkedUserId })
            } else {
              // Create new user account for the agent
              // Note: We'll create a minimal user account that can be linked later
              console.log('[Exchange API] No existing user found for email:', userEmail)
              // For now, we'll just store the email and let the profile route handle linking
            }
          }
        }
      } else {
        console.warn('[Exchange API] /userinfo endpoint returned non-OK status:', userInfoResponse.status)
      }
    } catch (userInfoError) {
      console.error('[Exchange API] Error fetching userinfo:', userInfoError)
      // Continue without user email - agent can still work without user context
    }

    // Set session cookie with user email and linked user ID
    const cookieStore = cookies()
    cookieStore.set({
      name: SESSION_COOKIE,
      value: JSON.stringify({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        agentId: introspectData.sub,
        model: introspectData.model,
        userEmail: userEmail, // Store user email for profile linking
        linkedUserId: linkedUserId, // Store linked user ID if found
        expiresAt: Date.now() + tokens.expires_in * 1000,
      }),
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokens.expires_in,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      agent_id: introspectData.sub,
      model: introspectData.model,
      user_email: userEmail, // Return user email for frontend
      linked_user_id: linkedUserId, // Return linked user ID if found
    })
  } catch (error: any) {
    console.error('Auth Agent token exchange error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      error: error,
    })
    return NextResponse.json(
      {
        error: 'server_error',
        error_description: error.message || 'Internal server error'
      },
      { status: 500 }
    )
  }
}
