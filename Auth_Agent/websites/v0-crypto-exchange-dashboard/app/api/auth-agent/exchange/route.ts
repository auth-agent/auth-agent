import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code, code_verifier } = await request.json()

    if (!code || !code_verifier) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing authorization code or code_verifier' },
        { status: 400 }
      )
    }

    const serverUrl = (process.env.AUTH_AGENT_SERVER_URL || 'https://api.auth-agent.com').replace(/\/+$/, '')
    const clientId = process.env.AUTH_AGENT_CLIENT_ID
    const clientSecret = process.env.AUTH_AGENT_CLIENT_SECRET
    const redirectUri = `${request.nextUrl.origin}/auth-agent/callback`

    if (!serverUrl || !clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'server_error', error_description: 'Auth Agent server configuration is missing' },
        { status: 500 }
      )
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch(`${serverUrl}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      const error = await tokenResponse.json().catch(() => ({}))
      return NextResponse.json(
        { error: error.error || 'invalid_grant', error_description: error.error_description || 'Token exchange failed' },
        { status: tokenResponse.status }
      )
    }

    const tokens = await tokenResponse.json()

    // Introspect the access token
    const introspectResponse = await fetch(`${serverUrl}/introspect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: tokens.access_token,
        token_type_hint: 'access_token',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })

    if (!introspectResponse.ok) {
      return NextResponse.json(
        { error: 'server_error', error_description: 'Failed to introspect access token' },
        { status: 500 }
      )
    }

    const introspectData = await introspectResponse.json()

    if (!introspectData.active) {
      return NextResponse.json(
        { error: 'invalid_token', error_description: 'Access token is not active' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      agent_id: introspectData.sub,
      model: introspectData.model,
      expires_in: tokens.expires_in,
    })
  } catch (error: any) {
    console.error('Auth Agent token exchange error:', error)
    return NextResponse.json(
      { error: 'server_error', error_description: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


