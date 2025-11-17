import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      social_links: {
        Row: {
          id: string
          profile_id: string
          platform: string
          username: string
          url: string
          display_order: number
          display_name: string | null
          custom_icon_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          platform: string
          username: string
          url: string
          display_order?: number
          display_name?: string | null
          custom_icon_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          platform?: string
          username?: string
          url?: string
          display_order?: number
          display_name?: string | null
          custom_icon_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 