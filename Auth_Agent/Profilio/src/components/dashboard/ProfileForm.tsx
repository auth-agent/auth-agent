'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'
import { X, User, AtSign, FileText, Globe, Loader2, Camera, Upload, Save, Check } from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileFormProps {
  profile: Profile | null
  onClose: () => void
  onSuccess: () => void
}

export default function ProfileForm({ profile, onClose, onSuccess }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [storageError, setStorageError] = useState<string | null>(null)
  const [bioError, setBioError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || '',
  })

  // Test storage bucket on component mount
  useEffect(() => {
    const testStorageBucket = async () => {
      if (!supabase) return
      
      try {
        const { data, error } = await supabase.storage
          .from('avatars')
          .list('', { limit: 1 })
        
        if (error) {
          console.error('Storage bucket test failed:', error)
          setStorageError(`Storage not available: ${error.message}`)
        } else {
          console.log('Storage bucket is accessible:', data)
          setStorageError(null)
        }
      } catch (error) {
        console.error('Storage test error:', error)
        setStorageError('Storage configuration error')
      }
    }

    testStorageBucket()
  }, [])

  const uploadAvatar = async (file: File) => {
    if (!supabase) {
      alert('Supabase is not configured')
      return
    }

    setUploadingAvatar(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}` // Remove avatars/ prefix as it's handled by bucket

      console.log('Uploading file:', fileName, 'to avatars bucket')

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting files
        })

      if (uploadError) {
        console.error('Upload error details:', uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      console.log('Upload successful:', uploadData)

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      console.log('Public URL:', data.publicUrl)
      setFormData({ ...formData, avatar_url: data.publicUrl })
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      alert(`Error uploading avatar: ${error.message || 'Please try again.'}`)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      uploadAvatar(file)
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

    // Prevent URLs in bio
    const urlRegex = /(https?:\/\/[\w.-]+(?:\.[\w\.-]+)+(?:[\w\-\._~:/?#[\]@!$&'()*+,;=]+)?)/g
    if (urlRegex.test(formData.bio)) {
      setBioError('Please do not include links or URLs in your bio. Use the social links section instead.')
      setLoading(false)
      return
    } else {
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update({
            username: formData.username,
            full_name: formData.full_name,
            bio: formData.bio,
            avatar_url: formData.avatar_url,
          })
          .eq('id', profile.id)

        if (error) throw error
      } else {
        // Create new profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            username: formData.username,
            full_name: formData.full_name,
            bio: formData.bio,
            avatar_url: formData.avatar_url,
          })

        if (error) throw error
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
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
              {profile ? 'Edit Profile' : 'Setup Profile'}
            </h3>
            <p className="text-gray-600 mt-1">
              {profile ? 'Update your profile information' : 'Create your professional profile'}
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
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Profile Picture
            </label>
            
            {storageError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  <strong>Storage Issue:</strong> {storageError}
                </p>
                <p className="text-xs text-red-500 mt-1">
                  Please check Supabase storage configuration or contact support.
                </p>
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                  {formData.avatar_url ? (
                    <img 
                      src={formData.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="avatar-upload"
                  disabled={uploadingAvatar || !!storageError}
                />
                <label
                  htmlFor="avatar-upload"
                  className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${storageError ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingAvatar ? 'Uploading...' : storageError ? 'Storage Unavailable' : 'Upload Photo'}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG or GIF (max 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-gray-900 mb-3">
              Username *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <AtSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="username"
                required
                className="input pl-12"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="your-username"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-3 rounded-xl">
              <strong>Your URL:</strong> profilio.com/{formData.username || 'your-username'}
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-semibold text-gray-900 mb-3">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="full_name"
                className="input pl-12"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Your full name"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-semibold text-gray-900 mb-3">
              Bio
            </label>
            <div className="relative">
              <div className="absolute top-6 left-4 pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="bio"
                rows={6}
                className="input pl-12 pt-6 resize-none text-base min-h-[96px]"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell people about yourself..."
                maxLength={160}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formData.bio.length}/160 characters
            </p>
          </div>

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
              disabled={loading || !formData.username}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {profile ? 'Update Profile' : 'Create Profile'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 