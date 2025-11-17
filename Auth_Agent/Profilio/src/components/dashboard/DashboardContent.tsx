'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase'
import { LogOut, Plus, ExternalLink, Copy, Check, Edit, Trash2, Link as LinkIcon, Share2, Eye, Users, QrCode, Mail } from 'lucide-react'
import { getSocialIcon } from '@/components/icons/SocialIcons'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import SocialLinkForm from './SocialLinkForm'
import ProfileForm from './ProfileForm'
import ProfileQRCode from './ProfileQRCode'
import Link from 'next/link'

type Profile = Database['public']['Tables']['profiles']['Row']
type SocialLink = Database['public']['Tables']['social_links']['Row'] & { display_name?: string, custom_icon_url?: string }

interface DashboardContentProps {
  user: User
  profile: Profile | null
  socialLinks: SocialLink[]
  onProfileUpdate: (profile: Profile) => void
  onSocialLinksUpdate: (links: SocialLink[]) => void
}

const PLATFORM_CONFIG: Record<string, { icon: string; color: string; bgColor: string }> = {
  'X': { icon: 'X', color: 'text-white', bgColor: 'bg-black' },
  'Twitter': { icon: 'X', color: 'text-white', bgColor: 'bg-black' }, // Legacy support
  'Instagram': { icon: 'Instagram', color: 'text-white', bgColor: 'bg-gradient-to-r from-[#405DE6] to-[#FD1D1D]' },
  'LinkedIn': { icon: 'LinkedIn', color: 'text-white', bgColor: 'bg-[#0077B5]' },
  'GitHub': { icon: 'GitHub', color: 'text-white', bgColor: 'bg-[#333]' },
  'YouTube': { icon: 'YouTube', color: 'text-white', bgColor: 'bg-[#FF0000]' },
  'TikTok': { icon: 'TikTok', color: 'text-white', bgColor: 'bg-black' },
  'Facebook': { icon: 'Facebook', color: 'text-white', bgColor: 'bg-[#1877F2]' },
  'Discord': { icon: 'Discord', color: 'text-white', bgColor: 'bg-[#5865F2]' },
  'Twitch': { icon: 'Twitch', color: 'text-white', bgColor: 'bg-[#9146FF]' },
  'Snapchat': { icon: 'Snapchat', color: 'text-black', bgColor: 'bg-[#FFFC00]' },
  'Spotify': { icon: 'Spotify', color: 'text-white', bgColor: 'bg-[#1DB954]' },
  'Pinterest': { icon: 'Pinterest', color: 'text-white', bgColor: 'bg-[#E60023]' },
  'Custom': { icon: 'Custom', color: 'text-gray-600', bgColor: 'bg-gray-100' },
}

// Helper function to get the icon component
const getPlatformIconComponent = (iconName: string) => {
  if (iconName === 'LinkIcon') return LinkIcon
  return getSocialIcon(iconName)
}

export default function DashboardContent({ user, profile, socialLinks, onProfileUpdate, onSocialLinksUpdate }: DashboardContentProps) {
  const router = useRouter()
  const [showSocialForm, setShowSocialForm] = useState(false)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null)
  
  // Suppress ESLint warnings for intentionally unused variables
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _unusedOnProfileUpdate = onProfileUpdate

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    router.push('/')
  }

  const profileUrl = profile?.username ? `https://profilio.online/${profile.username}` : ''

  const copyProfileUrl = async () => {
    if (profileUrl) {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.full_name || profile?.username}'s Profile`,
          text: 'Check out my social media links!',
          url: profileUrl,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      copyProfileUrl()
    }
  }

  const deleteSocialLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this social link?')) {
      return
    }

    try {
      if (!supabase) {
        alert('Supabase is not configured')
        return
      }

      const { error } = await supabase
        .from('social_links')
        .delete()
        .eq('id', linkId)

      if (error) throw error
      
      onSocialLinksUpdate(socialLinks.filter(link => link.id !== linkId))
    } catch (error) {
      console.error('Error deleting social link:', error)
      alert('Error deleting social link. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex items-center mr-6">
                <img 
                  src="/profilio-logo.png?v=1" 
                  alt="Profilio" 
                  className="h-10 w-10 object-contain -ml-1 mr-2"
                />
                <div className="text-xl font-bold text-gray-900">Profilio</div>
              </div>
              {/* Dashboard heading - hidden on mobile to prevent overlap */}
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your social presence</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="btn-ghost text-sm sm:text-base"
              >
                <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {profile?.full_name?.split(' ')[0] || profile?.username}! 👋
              </h1>
              <p className="text-gray-600">
                Manage your social links and share your digital presence with the world
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <Link
                href={`/${profile?.username}`}
                className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Your Profile
              </Link>
              <button
                onClick={shareProfile}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Profile
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <LinkIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Social Links</p>
                    <p className="text-2xl font-bold text-gray-900">{socialLinks.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Profile Status</p>
                    <p className="text-2xl font-bold text-green-600">{profile?.username ? 'Live' : 'Setup'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Your Profile</h2>
                <button
                  onClick={() => setShowProfileForm(true)}
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
              </div>
              
              <div className="flex items-start space-x-6">
                <div className="w-20 h-20 rounded-2xl shadow-lg overflow-hidden">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.full_name || profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {profile?.full_name?.charAt(0) || profile?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {profile?.full_name || profile?.username}
                  </h3>
                  <p className="text-blue-600 font-medium mb-3">@{profile?.username}</p>
                  
                  {profile?.bio ? (
                    <p className="text-gray-600 leading-relaxed mb-4">{profile?.bio}</p>
                  ) : (
                    <p className="text-gray-400 italic mb-4">Add a bio to tell people about yourself</p>
                  )}
                  
                  {profile?.website && (
                    <a
                      href={profile?.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      {profile?.website}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Social Links</h2>
                <button
                  onClick={() => {
                    setEditingLink(null)
                    setShowSocialForm(true)
                  }}
                  className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </button>
              </div>

              {socialLinks.length > 0 ? (
                <div className="space-y-4">
                  {socialLinks.map((link) => {
                    const config = PLATFORM_CONFIG[link.platform] || PLATFORM_CONFIG['Custom']
                    const displayName = link.platform === 'custom' && link.display_name ? link.display_name : link.platform
                    return (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                            {link.platform === 'custom' && link.custom_icon_url ? (
                              <img src={link.custom_icon_url} alt="Custom Icon" className="w-7 h-7 rounded object-cover" />
                            ) : (() => {
                              const IconComponent = getPlatformIconComponent(config.icon)
                              return <IconComponent className={`w-5 h-5 ${config.color}`} />
                            })()}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{displayName}</h3>
                            <p className="text-gray-600 text-sm">@{link.username}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => {
                              setEditingLink(link)
                              setShowSocialForm(true)
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteSocialLink(link.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LinkIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No social links yet</h3>
                  <p className="text-gray-600 mb-6">Add your social media accounts to get started</p>
                  <button
                    onClick={() => {
                      setEditingLink(null)
                      setShowSocialForm(true)
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Your First Link
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile URL Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Your Profile URL</h3>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600 break-all">{profileUrl}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={copyProfileUrl}
                  className="flex-1 flex items-center justify-center bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={shareProfile}
                  className="flex-1 flex items-center justify-center bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </button>
              </div>
            </div>

            {/* QR Code Section */}
            {profile?.username && (
              <ProfileQRCode 
                profileUrl={profileUrl}
                username={profile.username}
              />
            )}

            {/* Quick Tips */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">💡 Quick Tips</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Add all your social media accounts
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Write a compelling bio to describe yourself
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Share your profile link everywhere you have a bio
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Keep your links updated as you join new platforms
                </li>
              </ul>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Profile created
                </div>
                {socialLinks.length > 0 && (
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    {socialLinks.length} social link{socialLinks.length !== 1 ? 's' : ''} added
                  </div>
                )}
                {socialLinks.length === 0 && (
                  <div className="flex items-center text-gray-500">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                    No social links added yet
                  </div>
                )}
              </div>
            </div>

            {/* Help & Contact */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Need Help?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Have questions, found a bug, or want to share feedback? Send us an email!
              </p>
              <a
                href="mailto:hetkp8044@gmail.com"
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                hetkp8044@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showProfileForm && (
        <ProfileForm
          profile={profile}
          onSuccess={() => {
            setShowProfileForm(false)
            // Trigger a refresh of data
            window.location.reload()
          }}
          onClose={() => setShowProfileForm(false)}
        />
      )}

      {showSocialForm && profile && (
        <SocialLinkForm
          profileId={profile.id}
          editingLink={editingLink}
          onSuccess={() => {
            setShowSocialForm(false)
            setEditingLink(null)
            // Trigger a refresh of data
            window.location.reload()
          }}
          onClose={() => {
            setShowSocialForm(false)
            setEditingLink(null)
          }}
        />
      )}
    </div>
  )
} 