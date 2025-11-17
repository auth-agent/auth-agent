import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://profilio.online'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/demo`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  // Dynamic pages - get all public profiles
  try {
    if (!supabase) {
      console.error('Supabase client not initialized')
      return staticPages
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('username, updated_at')
      .not('username', 'is', null)

    const profilePages = profiles?.map((profile) => ({
      url: `${baseUrl}/${profile.username}`,
      lastModified: profile.updated_at ? new Date(profile.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })) || []

    return [...staticPages, ...profilePages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
} 