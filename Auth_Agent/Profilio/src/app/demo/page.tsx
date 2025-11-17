import ProfileView from '@/components/profile/ProfileView'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function DemoPage() {
  const supabase = await createSupabaseServerClient()
  // Fetch real profile for 'hetpatel'
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', 'hetpatel')
    .single()

  // Fetch social links for this profile
  let socialLinks = []
  if (profile) {
    const { data } = await supabase
      .from('social_links')
      .select('*')
      .eq('profile_id', profile.id)
      .order('display_order', { ascending: true })
    socialLinks = data || []
  }

  if (!profile) {
    return <div className="text-center py-20">Profile not found.</div>
  }

  return (
    <ProfileView 
      profile={profile}
      socialLinks={socialLinks}
    />
  )
} 