import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Profilio - One Link for All Your Social Media | Link in Bio Tool",
  description: "Create your social media portfolio with Profilio. Share your Instagram, X, LinkedIn, TikTok, YouTube, and all social profiles with one beautiful link. Includes QR code generation for easy sharing.",
  keywords: [
    "profilio", "profilio.online", "profolio", "portfolio", "profilo", "profilie",
    "link in bio", "linkinbio", "social media portfolio", "one link", "social links",
    "bio link", "qr code generator", "social media links",
    "instagram link", "tiktok link", "youtube link", "linkedin link",
    "social media manager", "influencer tools", "content creator tools",
    "social media bio", "link aggregator", "social portfolio",
    "free link in bio", "social media landing page", "personal brand",
    "social media profile", "link organizer", "social hub"
  ],
  authors: [{ name: "Profilio Team" }],
  creator: "Profilio",
  publisher: "Profilio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://profilio.online'),
  alternates: {
    canonical: 'https://profilio.online',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://profilio.online',
    title: 'Profilio - One Link for All Your Social Media',
    description: 'Create your social media portfolio with Profilio. Share your Instagram, X, LinkedIn, TikTok, YouTube, and all social profiles with one beautiful link. Includes QR code generation for easy sharing.',
    siteName: 'Profilio',
    images: [
      {
        url: '/profilio-logo.png',
        width: 1200,
        height: 630,
        alt: 'Profilio - One Link for All Your Social Media',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Profilio - One Link for All Your Social Media',
    description: 'Create your social media portfolio with Profilio. Share your Instagram, X, LinkedIn, TikTok, YouTube, and all social profiles with one beautiful link. Includes QR code generation for easy sharing.',
    images: ['/profilio-logo.png'],
    creator: '@profilio',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/profilio-logo.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/profilio-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
