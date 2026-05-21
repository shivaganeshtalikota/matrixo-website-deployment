'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProfileGuard from '@/components/ProfileGuard'

const NAVBAR_OFFSET_CLASS = 'pt-24'

export default function RootChrome({
  children,
  hostIsEmployeeSubdomain,
  initialPathname = '',
}: {
  children: React.ReactNode
  hostIsEmployeeSubdomain: boolean
  initialPathname?: string
}) {
  const pathnameFromRouter = usePathname()
  const pathname = pathnameFromRouter || initialPathname

  const isContactPage = pathname === '/contact' || pathname.startsWith('/contact/')
  const isEmployeePortal = hostIsEmployeeSubdomain || pathname.startsWith('/employee-portal')

  const showNavbar = !isEmployeePortal && !isContactPage
  const showFooter = !isEmployeePortal && !isContactPage

  const baseMainClassName =
    isEmployeePortal
      ? 'min-h-screen overflow-x-hidden'
      : `min-h-screen ${NAVBAR_OFFSET_CLASS} overflow-x-hidden`
  const mainClassName = isContactPage ? baseMainClassName : `${baseMainClassName} site-ambient`

  return (
    <>
      {showNavbar && <Navbar />}
      <main className={mainClassName}>
        {isEmployeePortal ? children : <ProfileGuard>{children}</ProfileGuard>}
      </main>
      {showFooter && <Footer />}
    </>
  )
}
