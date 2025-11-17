import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'auth-agent-session'

// Generate deterministic UUID from agent ID
async function generateAgentUUID(agentId: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(`agent-${agentId}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  // Format as UUID v4 (RFC 4122)
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    '4' + hex.slice(13, 16), // version 4
    ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16) + hex.slice(17, 20), // variant bits (10)
    hex.slice(20, 32)
  ].join('-')
}

export async function POST(request: NextRequest) {
  try {
    // Verify agent session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE)
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let session: {
      agentId: string
      model?: string
      userEmail?: string
      linkedUserId?: string
    }

    try {
      session = JSON.parse(sessionCookie.value)
    } catch {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const { agentId, model, userEmail, linkedUserId } = session
    const agentUserId = await generateAgentUUID(agentId)

    // Create Supabase client with service role (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Check if profile exists by username (agents have username starting with 'agent-')
    // Or by linked user_id if user matching was successful
    const username = `agent-${agentId.slice(-8)}`
    
    let existingProfile = null
    
    // First, check if there's a profile linked to the user
    if (linkedUserId) {
      const { data: linkedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', linkedUserId)
        .single()
      
      if (linkedProfile) {
        existingProfile = linkedProfile
        console.log('[Profile API] Found existing profile linked to user:', { userId: linkedUserId, profileId: linkedProfile.id })
      }
    }
    
    // If no linked profile, check by agent username
    if (!existingProfile) {
      const { data: agentProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()
      
      if (agentProfile) {
        existingProfile = agentProfile
        
        // If we have a linkedUserId but profile wasn't linked, update it
        if (linkedUserId && !agentProfile.user_id) {
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .update({ user_id: linkedUserId })
            .eq('id', agentProfile.id)
            .select()
            .single()
          
          if (updatedProfile) {
            existingProfile = updatedProfile
            console.log('[Profile API] Linked existing agent profile to user:', { userId: linkedUserId, profileId: updatedProfile.id })
          }
        }
      }
    }

    if (existingProfile) {
      return NextResponse.json({
        profile: existingProfile,
        linked_to_user: !!existingProfile.user_id,
        user_email: userEmail || null,
      })
    }

    // Create profile (using service role bypasses RLS)
    // Link to user_id if user matching was successful (Contextual Profile scenario)
    // Otherwise set user_id to NULL (Fresh Profile scenario)
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        user_id: linkedUserId || null, // Link to user if found, otherwise NULL for independent agent profile
        username: username,
        full_name: linkedUserId 
          ? `AI Agent (${model || 'unknown'}) - Linked to ${userEmail || 'user'}`
          : `AI Agent (${model || 'unknown'})`,
        bio: linkedUserId
          ? `Authenticated via Auth Agent OAuth 2.1 - Agent ID: ${agentId} - Linked to user account`
          : `Authenticated via Auth Agent OAuth 2.1 - Agent ID: ${agentId}`,
      })
      .select()
      .single()

    if (createError) {
      // If profile was created between check and insert, fetch it
      if (createError.code === '23505') { // Unique constraint violation
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single()

        if (profile) {
          return NextResponse.json({
            profile
          })
        }
      }

      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      profile: newProfile,
      linked_to_user: !!newProfile.user_id,
      user_email: userEmail || null,
    })
  } catch (error: any) {
    console.error('Agent profile creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify agent session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE)
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let session: {
      agentId: string
    }

    try {
      session = JSON.parse(sessionCookie.value)
    } catch {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    // Create Supabase client with service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get profile by username (agents use username, not user_id)
    const username = `agent-${session.agentId.slice(-8)}`
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found is OK
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      profile: profile || null
    })
  } catch (error: any) {
    console.error('Agent profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

