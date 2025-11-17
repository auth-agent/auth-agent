import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import ProfileView from '@/components/profile/ProfileView'

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const supabase = await createSupabaseServerClient()
  
  // Get profile by username
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !profile) {
    notFound()
  }

  // Get social links for this profile
  const { data: socialLinks } = await supabase
    .from('social_links')
    .select('*')
    .eq('profile_id', profile.id)
    .order('display_order', { ascending: true })

  return (
    <ProfileView 
      profile={profile}
      socialLinks={socialLinks || []}
    />
  )
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params
  const supabase = await createSupabaseServerClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, bio, avatar_url')
    .eq('username', username)
    .single()

  if (!profile) {
    return {
      title: 'Profile Not Found - Profilio',
      description: 'This profile could not be found.',
    }
  }

  const title = `${profile.full_name || profile.username} - Profilio`
  const description = profile.bio || `Check out ${profile.full_name || profile.username}'s social media links and portfolio on Profilio.`

  return {
    title,
    description,
    keywords: `${profile.full_name || profile.username}, social media, portfolio, links, ${username}`,
    openGraph: {
      title,
      description,
      url: `https://profilio.online/${username}`,
      siteName: 'Profilio',
      images: profile.avatar_url ? [
        {
          url: profile.avatar_url,
          width: 400,
          height: 400,
          alt: `${profile.full_name || profile.username}'s profile picture`,
        }
      ] : [
        {
          url: '/profilio-logo.png',
          width: 1200,
          height: 630,
          alt: 'Profilio - Social Media Portfolio Platform',
        }
      ],
      locale: 'en_US',
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : ['/profilio-logo.png'],
    },
    alternates: {
      canonical: `https://profilio.online/${username}`,
    },
  }
} 