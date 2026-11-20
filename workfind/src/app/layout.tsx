import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AuthProvider } from '@/lib/auth/context'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'WorkFind - Find Trusted Service Providers in Sri Lanka',
    template: '%s | WorkFind',
  },
  description:
    'Discover trusted professionals, skilled workers and service providers near you. Electricians, plumbers, cleaners, contractors and more.',
  keywords: [
    'service providers',
    'Sri Lanka',
    'electricians',
    'plumbers',
    'cleaners',
    'contractors',
    'freelancers',
    'handyman',
    'home services',
    'professional services',
  ],
  authors: [{ name: 'WorkFind' }],
  creator: 'WorkFind',
  publisher: 'WorkFind',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_LK',
    url: 'https://workfind.lk',
    siteName: 'WorkFind',
    title: 'WorkFind - Find Trusted Service Providers in Sri Lanka',
    description:
      'Discover trusted professionals, skilled workers and service providers near you.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'WorkFind - Sri Lanka Service Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WorkFind - Find Trusted Service Providers in Sri Lanka',
    description:
      'Discover trusted professionals, skilled workers and service providers near you.',
    images: ['/og-image.jpg'],
    creator: '@workfind',
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.supabase.co" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-secondary-900">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}