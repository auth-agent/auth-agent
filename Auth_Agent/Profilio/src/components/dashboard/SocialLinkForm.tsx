'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Link, Loader2, Eye } from 'lucide-react'
import { getSocialIcon } from '@/components/icons/SocialIcons'

interface SocialLinkFormProps {
  profileId: string
  editingLink?: {
    id: string
    profile_id: string
    platform: string
    username: string
    url: string
    display_order: number
    created_at: string
    updated_at: string
    display_name?: string
    custom_icon_url?: string
  } | null
  onClose: () => void
  onSuccess: () => void
}

const SOCIAL_PLATFORMS = [
  { 
    name: 'X', 
    baseUrl: 'https://x.com/', 
    placeholder: 'username', 
    icon: 'X', 
    color: 'bg-black',
    iconColor: 'text-white'
  },
  { 
    name: 'Instagram', 
    baseUrl: 'https://instagram.com/', 
    placeholder: 'username', 
    icon: 'Instagram', 
    color: 'bg-gradient-to-r from-[#405DE6] to-[#FD1D1D]',
    iconColor: 'text-white'
  },
  { 
    name: 'LinkedIn', 
    baseUrl: 'https://linkedin.com/in/', 
    placeholder: 'username', 
    icon: 'LinkedIn', 
    color: 'bg-[#0077B5]',
    iconColor: 'text-white'
  },
  { 
    name: 'GitHub', 
    baseUrl: 'https://github.com/', 
    placeholder: 'username', 
    icon: 'GitHub', 
    color: 'bg-[#333]',
    iconColor: 'text-white'
  },
  { 
    name: 'YouTube', 
    baseUrl: 'https://youtube.com/@', 
    placeholder: 'channel', 
    icon: 'YouTube', 
    color: 'bg-[#FF0000]',
    iconColor: 'text-white'
  },
  { 
    name: 'TikTok', 
    baseUrl: 'https://tiktok.com/@', 
    placeholder: 'username', 
    icon: 'TikTok', 
    color: 'bg-black',
    iconColor: 'text-white'
  },
  { 
    name: 'Facebook', 
    baseUrl: 'https://facebook.com/', 
    placeholder: 'username', 
    icon: 'Facebook', 
    color: 'bg-[#1877F2]',
    iconColor: 'text-white'
  },
  { 
    name: 'Discord', 
    baseUrl: 'https://discord.gg/', 
    placeholder: 'invite-code', 
    icon: 'Discord', 
    color: 'bg-[#5865F2]',
    iconColor: 'text-white'
  },
  { 
    name: 'Twitch', 
    baseUrl: 'https://twitch.tv/', 
    placeholder: 'username', 
    icon: 'Twitch', 
    color: 'bg-[#9146FF]',
    iconColor: 'text-white'
  },
  { 
    name: 'Snapchat', 
    baseUrl: 'https://snapchat.com/add/', 
    placeholder: 'username', 
    icon: 'Snapchat', 
    color: 'bg-[#FFFC00]',
    iconColor: 'text-black'
  },
  {
    name: 'Spotify',
    baseUrl: 'https://open.spotify.com/user/',
    placeholder: 'username',
    icon: 'Spotify',
    color: 'bg-[#1DB954]',
    iconColor: 'text-white'
  },
  {
    name: 'Pinterest',
    baseUrl: 'https://pinterest.com/',
    placeholder: 'username',
    icon: 'Pinterest',
    color: 'bg-[#E60023]',
    iconColor: 'text-white'
  },
]

// Helper function to get the icon component
const getIconComponent = (iconName: string) => {
  return getSocialIcon(iconName)
}

export default function SocialLinkForm({ profileId, editingLink, onClose, onSuccess }: SocialLinkFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    platform: editingLink?.platform || '',
    username: editingLink?.username || '',
    customUrl: editingLink?.platform === 'Custom' ? editingLink?.url : '',
    displayName: editingLink?.display_name || '',
    customIconUrl: editingLink?.custom_icon_url || '',
  })
  const [uploadingIcon, setUploadingIcon] = useState(false)
  
  const usernameInputRef = useRef<HTMLInputElement>(null)
  const customUrlInputRef = useRef<HTMLInputElement>(null)

  const selectedPlatform = SOCIAL_PLATFORMS.find(p => p.name === formData.platform)
  const finalUrl = selectedPlatform 
    ? `${selectedPlatform.baseUrl}${formData.username}`
    : formData.customUrl

  const handlePlatformSelect = (platformName: string) => {
    setFormData({ 
      ...formData, 
      platform: platformName, 
      username: formData.platform === platformName ? formData.username : '' 
    })
    
    // Auto-scroll to input field after a short delay
    setTimeout(() => {
      if (platformName === 'custom') {
        customUrlInputRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
        customUrlInputRef.current?.focus()
      } else {
        usernameInputRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
        usernameInputRef.current?.focus()
      }
    }, 100) // Small delay to ensure DOM updates
  }

  const handleCustomIconUpload = async (file: File) => {
    if (!supabase) return
    setUploadingIcon(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `custom-link-icon-${profileId}-${Date.now()}.${fileExt}`
      const { error } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
      if (error) throw error
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
      setFormData({ ...formData, customIconUrl: urlData.publicUrl })
    } catch (error) {
      console.error('Error uploading icon:', error)
      alert('Error uploading icon')
    } finally {
      setUploadingIcon(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!supabase) {
      alert('Supabase is not configured')
      setLoading(false)
      return
    }

    try {
      if (editingLink) {
        // Update existing link
        const { error } = await supabase
          .from('social_links')
          .update({
            platform: formData.platform || 'Custom',
            username: formData.username || formData.customUrl,
            url: finalUrl,
            display_name: formData.platform === 'custom' ? formData.displayName : null,
            custom_icon_url: formData.platform === 'custom' ? formData.customIconUrl : null,
          })
          .eq('id', editingLink.id)

        if (error) throw error
      } else {
        // Create new link
        const { error } = await supabase
          .from('social_links')
          .insert({
            profile_id: profileId,
            platform: formData.platform || 'Custom',
            username: formData.username || formData.customUrl,
            url: finalUrl,
            display_name: formData.platform === 'custom' ? formData.displayName : null,
            custom_icon_url: formData.platform === 'custom' ? formData.customIconUrl : null,
          })

        if (error) throw error
      }
      
      onSuccess()
    } catch (error) {
      console.error('Error saving social link:', error)
      alert('Error saving social link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-8 border-b border-gray-100">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {editingLink ? 'Edit Social Link' : 'Add Social Link'}
            </h3>
            <p className="text-gray-600 mt-1">
              {editingLink ? 'Update your social media account' : 'Connect your social media accounts'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Platform Selection */}
          <div>
            <label htmlFor="platform" className="block text-sm font-semibold text-gray-900 mb-3">
              Choose Platform
            </label>
            
            {/* Platform Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {SOCIAL_PLATFORMS.map((platform) => {
                const IconComponent = getIconComponent(platform.icon)
                return (
                  <button
                    key={platform.name}
                    type="button"
                    onClick={() => handlePlatformSelect(platform.name)}
                    className={`
                      p-4 rounded-xl border-2 transition-all duration-200 text-center hover:scale-105
                      ${formData.platform === platform.name 
                        ? 'border-purple-500 bg-purple-50 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                      }
                    `}
                  >
                    <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                      <IconComponent className={`w-5 h-5 ${platform.iconColor}`} />
                    </div>
                    <div className="text-xs font-medium text-gray-700">{platform.name}</div>
                  </button>
                )
              })}
              
              {/* Custom URL Option */}
              <button
                type="button"
                onClick={() => handlePlatformSelect('custom')}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 text-center hover:scale-105
                  ${formData.platform === 'custom' 
                    ? 'border-purple-500 bg-purple-50 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                  }
                `}
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Link className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-xs font-medium text-gray-700">Custom</div>
              </button>
            </div>
          </div>

          {/* Username Input */}
          {selectedPlatform && (
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-900 mb-3">
                Your {selectedPlatform.name} {selectedPlatform.placeholder}
              </label>
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-purple-300 focus-within:shadow-lg focus-within:shadow-purple-100/50 transition-all duration-200">
                <div className="flex items-center px-4 py-3 bg-gray-50 border-r-2 border-gray-200">
                  <div className={`w-6 h-6 ${selectedPlatform.color} rounded flex items-center justify-center mr-2`}>
                    {(() => {
                      const IconComponent = getIconComponent(selectedPlatform.icon)
                      return <IconComponent className={`w-4 h-4 ${selectedPlatform.iconColor}`} />
                    })()}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{selectedPlatform.baseUrl}</span>
                </div>
                <input
                  ref={usernameInputRef}
                  type="text"
                  id="username"
                  required
                  className="flex-1 px-4 py-3 bg-white focus:outline-none"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder={selectedPlatform.placeholder}
                />
              </div>
            </div>
          )}

          {/* Custom URL Input */}
          {formData.platform === 'custom' && (
            <>
              <div>
                <label htmlFor="displayName" className="block text-sm font-semibold text-gray-900 mb-3">
                  Display Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  className="input"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g. My Portfolio, Blog, etc."
                  maxLength={32}
                  required
                />
              </div>
              <div>
                <label htmlFor="customUrl" className="block text-sm font-semibold text-gray-900 mb-3">
                  Custom URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Link className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    ref={customUrlInputRef}
                    type="url"
                    id="customUrl"
                    required
                    className="input pl-12"
                    value={formData.customUrl}
                    onChange={(e) => setFormData({ ...formData, customUrl: e.target.value })}
                    placeholder="https://your-link.com"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Custom Icon (optional)</label>
                <div className="flex items-center space-x-4">
                  {formData.customIconUrl && (
                    <img src={formData.customIconUrl} alt="Custom Icon" className="w-12 h-12 rounded-lg object-cover border" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleCustomIconUpload(file)
                    }}
                    disabled={uploadingIcon}
                  />
                  {uploadingIcon && <Loader2 className="animate-spin w-5 h-5 text-gray-500" />}
                </div>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, SVG (max 2MB)</p>
              </div>
            </>
          )}

          {/* Preview */}
          {finalUrl && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <Eye className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-semibold text-gray-900">Preview</span>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-200">
                <div className={`w-12 h-12 ${selectedPlatform?.color || 'bg-gradient-to-r from-purple-500 to-pink-500'} rounded-xl flex items-center justify-center`}>
                  {formData.platform === 'custom' && formData.customIconUrl ? (
                    <img src={formData.customIconUrl} alt="Custom Icon" className="w-10 h-10 rounded object-cover" />
                  ) : (() => {
                    const IconComponent = getIconComponent(selectedPlatform?.icon || 'Link')
                    return <IconComponent className={`w-6 h-6 ${selectedPlatform?.iconColor || 'text-white'}`} />
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900">{formData.platform === 'custom' ? formData.displayName || 'Custom' : (formData.platform || 'Custom')}</h4>
                  <p className="text-sm text-gray-600 truncate">@{formData.username || 'username'}</p>
                  <p className="text-xs text-gray-500 truncate">{finalUrl}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !finalUrl}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingLink ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Link className="h-4 w-4 mr-2" />
                  {editingLink ? 'Update Link' : 'Add Link'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 