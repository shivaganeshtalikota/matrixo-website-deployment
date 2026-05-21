import type { Metadata } from 'next'
import Hero from '@/components/home/Hero'
import BetaFeaturesShowcase from '@/components/home/BetaFeaturesShowcase'
import Stats from '@/components/home/Stats'

export const metadata: Metadata = {
  title: 'matriXO - AI-Powered Career Growth Platform',
  description: 'matriXO is an ed-tech platform offering hands-on technical workshops, hackathons, bootcamps, and career-focused events for students. Build industry-ready skills with expert mentorship.',
  keywords: 'matriXO, technical workshops, hackathons, bootcamps, career events, ed-tech, coding workshops, student training, industry skills',
  openGraph: {
    type: 'website',
    url: 'https://matrixo.in',
    title: 'matriXO - AI-Powered Career Growth Platform',
    description: 'Map your skills with AI. Grow with personalized paths. Prove your worth with verified credentials. matriXO — the future of career development.',
    siteName: 'matriXO',
    images: [
      {
        url: '/logos/logo-dark.png',
        width: 1200,
        height: 630,
        alt: 'matriXO - AI-Powered Career Growth Platform',
        type: 'image/png',
      },
      {
        url: '/logos/logo-dark.png',
        width: 1080,
        height: 1080,
        alt: 'matriXO - AI-Powered Career Growth Platform',
        type: 'image/png',
      },
    ],
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'matriXO - AI-Powered Career Growth Platform',
    description: 'Map your skills with AI. Grow with personalized paths. Prove your worth with verified credentials.',
    images: ['/logos/logo-dark.png'],
    creator: '@matrixo',
  },
  other: {
    'instagram:card': 'summary_large_image',
    'instagram:title': 'matriXO - AI-Powered Career Growth Platform',
    'instagram:description': 'AI-powered skill analysis, personalized learning, and blockchain-verified credentials.',
    'instagram:image': 'https://matrixo.in/logos/logo-dark.png',
  },
}

export default function Home() {
  return (
    <div>
      <Hero />
      <Stats />
      <BetaFeaturesShowcase />
    </div>
  )
}
