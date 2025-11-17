import Link from 'next/link'
import { getSocialIcon } from '@/components/icons/SocialIcons'
import { supabase } from '@/lib/supabase'
import ContactButton from '@/components/common/ContactButton'
import Script from 'next/script'

// Helper to get platform colors
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
    Discord: "text-indigo-600",
    Twitch: "text-purple-600",
    Spotify: "text-green-500",
    Pinterest: "text-red-600",
  }
  return platformColors[platform] || 'text-gray-600'
}

export default async function Home() {
  // Fetch actual profile data for hetpatel
  let profile = null
  let socialLinks = null
  
  if (supabase) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', 'hetpatel')
        .single()
      
      profile = data

      if (profile) {
        const { data: links } = await supabase
          .from('social_links')
          .select('*')
          .eq('profile_id', profile.id)
          .order('display_order', { ascending: true })
        
        socialLinks = links
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
    }
  }

  // Fallback data if profile not found
  const displayProfile = profile || {
    username: 'hetpatel',
    full_name: 'Het Patel',
    bio: 'Developer & creator'
  }

  const displaySocialLinks = socialLinks || []

  // Generate initials from full name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Enhanced structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Profilio",
    "alternateName": ["Profilio.online", "Profilio Link in Bio", "Profilio Social Portfolio"],
    "description": "Create your social media portfolio with Profilio. Share your Instagram, X, LinkedIn, TikTok, YouTube, and all social profiles with one beautiful link. Includes QR code generation for easy sharing.",
    "url": "https://profilio.online",
    "applicationCategory": "SocialNetworkingApplication",
    "operatingSystem": "Web",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "author": {
      "@type": "Organization",
      "name": "Profilio",
      "url": "https://profilio.online"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Profilio",
      "url": "https://profilio.online"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    },
    "keywords": "link in bio, social media portfolio, qr code generator, social links, bio link, profilio, social media manager, influencer tools",
    "sameAs": [
      "https://profilio.online"
    ]
  }

  // Additional structured data for better search visibility
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Profilio",
    "url": "https://profilio.online",
    "logo": "https://profilio.online/profilio-logo.png",
    "description": "Free link in bio tool for social media creators and influencers",
    "foundingDate": "2024",
    "keywords": "social media, link in bio, portfolio, social links"
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Structured Data for SEO */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Script
        id="organization-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />

      {/* Responsive Header */}
      <header className="bg-white">
        <div className="max-w-md sm:max-w-lg md:max-w-full lg:max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/profilio-logo.png?v=1" 
              alt="Profilio" 
              className="h-9 w-9 md:h-12 md:w-12 object-contain -ml-1 mr-2"
            />
            <div className="text-xl md:text-3xl font-bold text-gray-900">Profilio</div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth"
              className="text-gray-500 hover:text-gray-900 text-base md:text-lg font-medium"
            >
              Sign in
            </Link>
            <Link
              href="/ai-auth/login"
              className="hidden sm:inline-flex items-center rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Agent login
            </Link>
          </div>
        </div>
      </header>

      {/* Responsive Hero Section */}
      <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto px-6 py-16 md:py-24 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
          One link for all your socials
        </h1>
        
        <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-10 md:mb-12 leading-relaxed max-w-2xl mx-auto">
          Share your Instagram, X, LinkedIn, TikTok, YouTube, and all social profiles with a single, beautiful link. Includes QR code generation for easy sharing.
        </p>

        <div className="max-w-md mx-auto">
          <Link
            href="/auth"
            className="w-full bg-black text-white px-8 py-4 md:py-5 rounded-full text-lg md:text-xl font-medium hover:bg-gray-800 transition-colors inline-block"
          >
            Create your link
          </Link>
          <Link
            href="/ai-auth/login"
            className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-gray-200 px-6 py-4 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Test Auth Agent login
          </Link>
        </div>

        <p className="text-gray-500 text-sm md:text-base mt-4 md:mt-6">
          Free forever. Setup in 30 seconds.
        </p>
      </div>

      {/* Responsive Examples Section */}
      <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto px-6 pb-16 md:pb-24">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">See how others use it</h2>
        </div>
        
        {/* Responsive example card - Clickable */}
        <Link href="/hetpatel" className="block">
          <div className="bg-white rounded-3xl p-6 md:p-8 lg:p-10 text-center shadow-sm border border-gray-100 mb-8 md:mb-12 max-w-md mx-auto hover:shadow-lg hover:border-gray-200 transition-all duration-200 cursor-pointer">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto mb-4 md:mb-6 shadow-lg overflow-hidden">
              {displayProfile.avatar_url ? (
                <img 
                  src={displayProfile.avatar_url} 
                  alt={displayProfile.full_name || displayProfile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg md:text-xl">{getInitials(displayProfile.full_name)}</span>
                </div>
              )}
            </div>
            <h3 className="font-bold text-gray-900 mb-1 text-lg md:text-xl">{displayProfile.full_name}</h3>
            <p className="text-gray-500 text-sm md:text-base mb-1">@{(displayProfile as any).username}</p>
            <p className="text-gray-600 text-xs md:text-sm mb-6 md:mb-8">
              {displayProfile.bio}
            </p>
            
            <div className="space-y-2 md:space-y-3">
              {displaySocialLinks.length > 0 ? (
                displaySocialLinks.map((link: any) => (
                  <div key={link.platform + link.display_name + link.url} className="flex items-center justify-center bg-gray-50 rounded-full p-3 md:p-4">
                    <div className={`mr-3`}>
                      {link.platform === 'custom' && link.custom_icon_url ? (
                        <img src={link.custom_icon_url} alt="Custom Icon" className="w-5 h-5 md:w-6 md:h-6 rounded object-cover" />
                      ) : (() => {
                        const IconComponent = getSocialIcon(link.platform)
                        return <IconComponent className={`w-4 h-4 md:w-5 md:h-5 ${getPlatformColor(link.platform)}`} />
                      })()}
                    </div>
                    <span className="text-sm md:text-base font-medium text-gray-900">{link.platform === 'custom' && link.display_name ? link.display_name : link.platform}</span>
                  </div>
                ))
              ) : (
                // Fallback preview if no social links are set up yet
                <>
                  <div className="flex items-center justify-center bg-gray-50 rounded-full p-3 md:p-4">
                    <div className={`mr-3 ${getPlatformColor("GitHub")}`}>
                      {(() => {
                        const IconComponent = getSocialIcon("GitHub")
                        return <IconComponent className="w-4 h-4 md:w-5 md:h-5" />
                      })()}
                    </div>
                    <span className="text-sm md:text-base font-medium text-gray-900">GitHub</span>
                  </div>
                  <div className="flex items-center justify-center bg-gray-50 rounded-full p-3 md:p-4">
                    <div className={`mr-3 ${getPlatformColor("LinkedIn")}`}>
                      {(() => {
                        const IconComponent = getSocialIcon("LinkedIn")
                        return <IconComponent className="w-4 h-4 md:w-5 md:h-5" />
                      })()}
                    </div>
                    <span className="text-sm md:text-base font-medium text-gray-900">LinkedIn</span>
                  </div>
                  <div className="flex items-center justify-center bg-gray-50 rounded-full p-3 md:p-4">
                    <div className={`mr-3 ${getPlatformColor("X")}`}>
                      {(() => {
                        const IconComponent = getSocialIcon("X")
                        return <IconComponent className="w-4 h-4 md:w-5 md:h-5" />
                      })()}
                    </div>
                    <span className="text-sm md:text-base font-medium text-gray-900">X</span>
                  </div>
                </>
              )}
            </div>
            
            {/* Subtle click indicator */}
            <div className="mt-4 md:mt-6">
              <p className="text-xs text-gray-400">Click to view profile →</p>
            </div>
          </div>
        </Link>

        <div className="text-center">
          <Link
            href="/auth"
            className="text-gray-600 text-sm md:text-base font-medium hover:text-gray-900 transition-colors"
          >
            Create yours now →
          </Link>
        </div>
      </div>

      {/* SEO-friendly Features Section */}
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            Complete Social Media Portfolio with QR Code Generation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-lg mb-3">Free Link in Bio Tool</h3>
              <p className="text-gray-600">Create unlimited social media links for Instagram, TikTok, YouTube, LinkedIn, and more. No hidden fees or premium plans required.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-lg mb-3">QR Code Generation</h3>
              <p className="text-gray-600">Generate QR codes for your profile link to make sharing even easier. Perfect for business cards, flyers, and offline marketing.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-lg mb-3">One Link for Everything</h3>
              <p className="text-gray-600">Share all your social profiles, websites, and content with a single link. Easy to remember and share across all platforms.</p>
            </div>
          </div>
          <div className="mt-12">
            <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
              <span className="bg-white px-3 py-1 rounded-full">Link in Bio</span>
              <span className="bg-white px-3 py-1 rounded-full">Social Media Portfolio</span>
              <span className="bg-white px-3 py-1 rounded-full">QR Code Generator</span>
              <span className="bg-white px-3 py-1 rounded-full">Bio Link Tool</span>
              <span className="bg-white px-3 py-1 rounded-full">Social Links</span>
              <span className="bg-white px-3 py-1 rounded-full">Influencer Tools</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Contact Button */}
      <ContactButton />
    </div>
  )
}
