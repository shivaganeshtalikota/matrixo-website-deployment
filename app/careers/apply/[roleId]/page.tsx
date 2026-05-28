import { Metadata } from 'next'
import ApplicationForm from '@/components/careers/ApplicationForm'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'

// Use the shared Firestore instance from `lib/firebaseConfig`
function getServerDb() {
  return db
}

export async function generateMetadata({ params }: { params: { roleId: string } }): Promise<Metadata> {
  try {
    const db = getServerDb()
    if (!db) {
      console.warn('[careers] Firestore not initialized (missing Firebase config). Using fallback metadata.')
      return {
        title: 'Apply - Careers | matriXO',
        description: 'Submit your application to join the matriXO team.',
      }
    }

    const roleDoc = await getDoc(doc(db, 'roles', params.roleId))
    if (roleDoc.exists()) {
      const role = roleDoc.data()
      return {
        title: `${role.title} - Apply | matriXO`,
        description: role.description?.slice(0, 160) || `Apply for ${role.title} at matriXO. ${role.team} team, ${role.location}, ${role.type}.`,
        openGraph: {
          title: `${role.title} - Careers at matriXO`,
          description: role.description?.slice(0, 160) || `Join our ${role.team} team.`,
          url: `https://matrixo.in/careers/apply/${params.roleId}`,
          siteName: 'matriXO',
          images: [{ url: 'https://matrixo.in/logos/matrixo logo wide.png', width: 1200, height: 630, alt: `${role.title} - matriXO` }],
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: `${role.title} - Apply at matriXO`,
          description: role.description?.slice(0, 160) || `Join our ${role.team} team.`,
          images: ['https://matrixo.in/logos/matrixo logo wide.png'],
        },
      }
    }
  } catch (e) {
    console.error('Error generating metadata:', e)
  }
  return {
    title: 'Apply - Careers | matriXO',
    description: 'Submit your application to join the matriXO team.',
  }
}

export default function ApplyPage({ params }: { params: { roleId: string } }) {
  return <ApplicationForm roleId={params.roleId} />
}
