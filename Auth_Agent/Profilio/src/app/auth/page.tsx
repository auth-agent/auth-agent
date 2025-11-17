import Link from 'next/link'
import AuthForm from '@/components/auth/AuthForm'
import { ArrowLeft } from 'lucide-react'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Simple Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-12"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>

        {/* Simple Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Create your profile
          </h1>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <AuthForm />
        </div>

        {/* Simple Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Free to use. No credit card required.
          </p>
        </div>
      </div>
    </div>
  )
} 