'use client'

import Link from 'next/link'
import { Database } from '@/lib/supabase'
import { ExternalLink, User, Share2, Copy, Check, MapPin, LinkIcon } from 'lucide-react'
import { getSocialIcon } from '@/components/icons/SocialIcons'
import ProfileQRCode from '@/components/dashboard/ProfileQRCode'

type Profile = Database['public']['Tables']['profiles']['Row']
type SocialLink = Database['public']['Tables']['social_links']['Row'] & { display_name?: string, custom_icon_url?: string }

interface ProfileViewProps {
  profile: Profile
  socialLinks: SocialLink[]
}

// Helper to get platform color
const getPlatformColor = (platform: string) => {
  const platformColors: Record<string, string> = {
    Instagram: "text-pink-500",
    TikTok: "text-black",
    YouTube: "text-red-500",
    LinkedIn: "text-blue-600",
    GitHub: "text-gray-800",
    X: "text-black",
    Facebook: "text-blue-600",
    Snapchat: "text-yellow-400",
    Spotify: "text-green-500",
    Pinterest: "text-red-600",
    Discord: "text-indigo-600",
    Twitch: "text-purple-600",
    Newsletter: "text-gray-600",
    Website: "text-gray-600"
  }
  return platformColors[platform] || 'text-gray-600'
}

export default function ProfileView({ profile, socialLinks }: ProfileViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Profile Content - Responsive bio.link style layout */}
      <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto px-6 py-8 md:py-12">
        {/* Profile Header - Responsive design */}
        <div className="text-center mb-8 md:mb-12">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-4 md:mb-6 shadow-lg overflow-hidden">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.full_name || profile.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-2xl md:text-3xl font-bold">
                  {profile.full_name?.charAt(0) || profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 md:mb-2">
            {profile.full_name || profile.username}
          </h1>
          <p className="text-gray-500 text-sm md:text-base mb-3 md:mb-4">@{profile.username}</p>
          {profile.bio && (
            <p className="text-gray-700 text-sm md:text-base leading-relaxed max-w-xs md:max-w-md lg:max-w-lg mx-auto">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Social Links - Responsive bio.link style buttons */}
        {socialLinks.length > 0 ? (
          <div className="space-y-3 md:space-y-4 max-w-md md:max-w-lg mx-auto">
            {socialLinks.map((link) => {
              const displayName = link.platform === 'custom' && link.display_name ? link.display_name : link.platform
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-white hover:bg-gray-50 rounded-full p-4 md:p-5 transition-all duration-200 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md group"
                >
                  <div className={`mr-3 md:mr-4`}>
                    {link.platform === 'custom' && link.custom_icon_url ? (
                      <img src={link.custom_icon_url} alt="Custom Icon" className="w-6 h-6 md:w-7 md:h-7 rounded object-cover" />
                    ) : (() => {
                      const IconComponent = getSocialIcon(link.platform)
                      return <IconComponent className={`w-5 h-5 md:w-6 md:h-6 ${getPlatformColor(link.platform)}`} />
                    })()}
                  </div>
                  <span className="font-medium text-gray-900 text-center flex-1 text-sm md:text-base">
                    {displayName}
                  </span>
                  <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-12 text-center shadow-sm max-w-md md:max-w-lg mx-auto">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <ExternalLink className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">No links yet</h3>
            <p className="text-gray-500 text-sm md:text-base">This profile is still being set up</p>
          </div>
        )}

        {/* Call to Action - Responsive minimal footer */}
        <div className="mt-8 md:mt-12 text-center max-w-md md:max-w-lg mx-auto">
          <Link
            href="/auth"
            className="inline-flex items-center justify-center w-full bg-black text-white rounded-full p-4 md:p-5 hover:bg-gray-800 transition-colors font-medium text-sm md:text-base mb-6 md:mb-8"
          >
            Create your own link
          </Link>
          
          {/* Minimal footer */}
          <p className="text-xs md:text-sm text-gray-400">
            Powered by{' '}
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Profilio
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 