import './globals.css'
import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/lib/AuthContext'
import { ProfileProvider } from '@/lib/ProfileContext'
import ProfileGuard from '@/components/ProfileGuard'
import ThemeProvider from '@/components/ThemeProvider'
import { Toaster } from 'sonner'
import Script from 'next/script'
import { headers } from 'next/headers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://matrixo.in'),
  title: {
    default: 'matriXO - Technical Workshops, Events & Bootcamps for Students',
    template: '%s | matriXO'
  },
  description: 'matriXO — Your gateway to technical excellence. Workshops, hackathons, bootcamps, and career-focused events designed for students. An Ed-Tech Startup.',
  keywords: 'matriXO, technical workshops, hackathons, bootcamps, student events, career development, tech events, coding workshops, student training',
  authors: [{ name: 'matriXO Team' }],
  creator: 'matriXO',
  publisher: 'matriXO',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://matrixo.in',
    siteName: 'matriXO',
    title: 'matriXO - Technical Workshops & Career-Focused Events',
    description: 'Technical workshops, hackathons, and bootcamps for student career growth. Join our events and accelerate your tech journey.',
    images: [
      {
        url: 'https://matrixo.in/logos/matrixo logo wide.png',
        width: 1200,
        height: 630,
        alt: 'matriXO - Technical Workshops & Events',
        type: 'image/png',
      },
      {
        url: 'https://matrixo.in/logos/logo-dark.png',
        width: 1080,
        height: 1080,
        alt: 'matriXO Logo',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'matriXO - Technical Workshops & Career-Focused Events',
    description: 'Technical workshops, hackathons, and bootcamps for student career growth.',
    images: ['https://matrixo.in/logos/matrixo logo wide.png'],
    creator: '@matrixo',
  },
  other: {
    'instagram:card': 'summary_large_image',
    'instagram:title': 'matriXO - Technical Workshops & Career-Focused Events',
    'instagram:description': 'Technical workshops, hackathons, and bootcamps for student career growth. Join our events!',
    'instagram:image': 'https://matrixo.in/logos/matrixo logo wide.png',
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
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const initialPathname = headersList.get('x-pathname') || ''
  const host = headersList.get('host') || ''
  const isEmployeePortal = host.includes('team-auth') || initialPathname.includes('/employee-portal')

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* iOS PWA Configuration - Required for location & other permissions in standalone mode */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="matriXO Team Auth" />
        <link rel="apple-touch-icon" href="/favicon.png" />

        {/* Theme color for PWA */}
        <meta name="theme-color" content="#0a0a0a" />

        {/* Dark Mode Script - Default to DARK mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Apply dark mode unless light mode was explicitly saved
                if (localStorage.getItem('theme') !== 'light') {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased overflow-x-hidden max-w-full">
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KFF7KV3Z11"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KFF7KV3Z11');
          `}
        </Script>

        <ThemeProvider defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            <ProfileProvider>
              {!isEmployeePortal && <Navbar />}
              <main className={isEmployeePortal ? 'min-h-screen overflow-x-hidden' : 'min-h-screen pt-24 overflow-x-hidden site-ambient'}>
                {isEmployeePortal ? children : <ProfileGuard>{children}</ProfileGuard>}
              </main>
              {!isEmployeePortal && <Footer />}
            </ProfileProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
