import { Metadata } from 'next'
import AboutContent from '@/components/about/AboutContent'

export const metadata: Metadata = {
  title: 'About Us - matriXO',
  description: 'Learn about matriXO - an EdTech startup supported by KPRISE (KPR Foundation for Innovation and Social Empowerment), revolutionizing event ticketing for students and educational institutions.',
}

export default function AboutPage() {
  return (
    <>
      <AboutContent />
    </>
  )
}
