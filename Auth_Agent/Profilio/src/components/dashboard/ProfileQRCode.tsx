'use client'

import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Download, QrCode as QrCodeIcon } from 'lucide-react'

interface ProfileQRCodeProps {
  profileUrl: string
  username: string
}

export default function ProfileQRCode({ profileUrl, username }: ProfileQRCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    generateQRCode()
  }, [profileUrl])

  const generateQRCode = async () => {
    try {
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(profileUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(qrDataUrl)

      // Also generate on canvas for download
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, profileUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const downloadQRCode = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.download = `${username}-profilio-qr.png`
      link.href = canvasRef.current.toDataURL()
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <QrCodeIcon className="h-5 w-5 mr-2" />
          Your QR Code
        </h3>
        <button
          onClick={downloadQRCode}
          className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </button>
      </div>
      
      <div className="text-center">
        {qrCodeUrl && (
          <div className="bg-white rounded-lg p-4 border border-gray-100 inline-block">
            <img 
              src={qrCodeUrl} 
              alt="Profile QR Code" 
              className="w-40 h-40 mx-auto"
            />
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-3 max-w-xs mx-auto">
          People can scan this QR code to instantly access your profile and all your social links
        </p>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-700 mb-1">Perfect for:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Business cards</li>
            <li>• Event networking</li>
            <li>• Conference presentations</li>
            <li>• Print materials</li>
          </ul>
        </div>
      </div>

      {/* Hidden canvas for download */}
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }}
      />
    </div>
  )
} 