'use client'

import { Mail } from 'lucide-react'

export default function ContactButton() {
  return (
    <a
      href="mailto:hetkp8044@gmail.com"
      className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group z-40"
      title="Contact us"
    >
      <Mail className="h-6 w-6" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        hetkp8044@gmail.com
      </span>
    </a>
  )
} 