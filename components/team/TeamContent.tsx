'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaLinkedin, FaEnvelope } from 'react-icons/fa'
import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'
import Link from 'next/link'

interface TeamMember {
  employeeId: string
  name: string
  email: string
  department: string
  designation: string
  joiningDate: string
  profileImage: string
  role: string
  linkedin?: string
}

// Define role priority for sorting (Founders & Co-Founders first, then HR & MD, then employees)
const rolePriority: Record<string, number> = {
  'Founder': 0,
  'founder': 0,
  'Co-Founder': 1,
  'co-founder': 1,
  'MD': 2,
  'md': 2,
  'Managing Director': 2,
  'managing director': 2,
  'HR': 3,
  'hr': 3,
  'HR Executive': 3,
  'hr executive': 3,
  'admin': 4,
  'employee': 5,
  'Intern': 6,
  'intern': 6,
}

function getRolePriority(role: string): number {
  const normalizedRole = role.trim()
  return rolePriority[normalizedRole] ?? rolePriority[normalizedRole.toLowerCase()] ?? 5
}

// Display-friendly role label
function getDisplayRole(member: TeamMember): string {
  if (member.designation) return member.designation
  const normalizedRole = member.role.toLowerCase()
  if (normalizedRole === 'admin') return 'Admin'
  if (normalizedRole === 'intern') return 'Intern'
  if (normalizedRole === 'employee') return 'Team Member'
  return member.role
}

// LinkedIn mapping by name keywords (fallback if not stored in Firestore)
const linkedinMap: Record<string, string> = {
  'lahari': 'https://www.linkedin.com/in/lahari-rami-reddy-950352262',
  'yasasvi': 'https://www.linkedin.com/in/yasasvi-mandapati',
  'shiva': 'https://www.linkedin.com/in/shivaganesht',
  'kishan': 'https://www.linkedin.com/in/kishan-sai-vutukuri',
  'vinod': 'https://www.linkedin.com/in/vinod-kethavath-2733a5317',
  'karthik': 'https://www.linkedin.com/in/karthik-chinthakindi-aa93a7287',
  'jahnavi': 'https://www.linkedin.com/in/jahnavi-mulukutla',
  'shravya': 'https://www.linkedin.com/in/shravya-datla-388447287',
  'manideep': 'https://www.linkedin.com/in/manideep-botsa/',
  'akshar': 'https://www.linkedin.com/in/akshar-sunkari-523aaa278/',
  'praneep': 'https://www.linkedin.com/in/praneep-sri-32564a355/',
  'nithin': 'https://www.linkedin.com/in/nithin-yelamati-273513290/',
}

function getLinkedin(name: string, firestoreLinkedin?: string): string {
  if (firestoreLinkedin) return firestoreLinkedin
  const nameLower = name.toLowerCase()
  for (const [key, url] of Object.entries(linkedinMap)) {
    if (nameLower.includes(key)) return url
  }
  return ''
}

// Local profile image mapping (fallback when Firestore profileImage is empty)
const localProfileImages: Record<string, string> = {
  'M-A001': '/intern-images/M-A001.webp',
  'M-A005': '/intern-images/M-A005.webp',
  'M-A006': '/intern-images/M-A006.webp',
  'M-A008': '/intern-images/M-A008.webp',
  'M-A009': '/intern-images/M-A009.webp',
  'M-A010': '/intern-images/M-A010.webp',
  'M-A011': '/intern-images/M-A011.webp',
  'M-A012': '/intern-images/M-A012.webp',
  'M-A013': '/intern-images/M-A013.webp',
}

const localNameImageFallbacks: Record<string, string> = {
  'shiva': '/team/shiva.webp',
  'kishan': '/team/kishan.webp',
}

const fallbackTeamMembers: TeamMember[] = [
  {
    employeeId: 'FOUNDER-1',
    name: 'Shiva Ganesh Talikota',
    email: 'hello@matrixo.in',
    department: 'Leadership',
    designation: 'Founder',
    joiningDate: '',
    profileImage: '/team/shiva.webp',
    role: 'Founder',
    linkedin: 'https://www.linkedin.com/in/shivaganesht',
  },
  {
    employeeId: 'FOUNDER-2',
    name: 'Kishan Sai Vutukuri',
    email: 'hello@matrixo.in',
    department: 'Leadership',
    designation: 'Co-Founder',
    joiningDate: '',
    profileImage: '/team/kishan.webp',
    role: 'Co-Founder',
    linkedin: 'https://www.linkedin.com/in/kishan-sai-vutukuri',
  },
]

function pickFirstString(data: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = data[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function normalizeImagePath(imagePath: string): string {
  if (!imagePath) return ''
  const trimmed = imagePath.trim()
  if (!trimmed) return ''
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed
  if (trimmed.startsWith('/')) return trimmed
  const normalized = trimmed.replace(/^public[\\/]/i, '').replace(/\\/g, '/')
  return `/${normalized}`
}

function getProfileImage(employeeId: string, firestoreImage: string, name: string): string {
  const normalizedFirestoreImage = normalizeImagePath(firestoreImage)
  if (normalizedFirestoreImage) return normalizedFirestoreImage
  if (localProfileImages[employeeId]) return localProfileImages[employeeId]
  const nameLower = name.toLowerCase()
  for (const [key, imagePath] of Object.entries(localNameImageFallbacks)) {
    if (nameLower.includes(key)) return imagePath
  }
  return ''
}

function getInitials(name: string): string {
  const initials = name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
  return initials || 'TM'
}

export default function TeamContent() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeesRef = collection(db, 'Employees')
        const q = query(employeesRef)
        const querySnapshot = await getDocs(q)
        
        const members: TeamMember[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Record<string, unknown>
          const role = pickFirstString(data, ['role']) || 'employee'
          const designation = pickFirstString(data, ['designation', 'title'])
          const employeeId = pickFirstString(data, ['employeeId', 'id']) || doc.id
          const name = pickFirstString(data, ['name', 'fullName', 'displayName', 'employeeName']) || employeeId
          const email = pickFirstString(data, ['email'])
          const department = pickFirstString(data, ['department', 'team'])
          const joiningDate = pickFirstString(data, ['joiningDate'])
          const firestoreProfileImage = pickFirstString(data, ['profileImage', 'photoURL', 'image'])

          // Skip the Admin account from the team page
          if (
            name.toLowerCase() === 'admin' ||
            employeeId.toLowerCase() === 'admin' ||
            (role.toLowerCase() === 'admin' && !designation)
          ) {
            return
          }

          members.push({
            employeeId,
            name,
            email,
            department,
            designation,
            joiningDate,
            profileImage: getProfileImage(employeeId, firestoreProfileImage, name),
            role,
            linkedin: getLinkedin(name, pickFirstString(data, ['linkedin', 'linkedinUrl'])),
          })
        })

        // Sort: Founders first, then Co-Founders, then admins, then employees, then interns
        members.sort((a, b) => {
          const priorityA = getRolePriority(a.designation || a.role)
          const priorityB = getRolePriority(b.designation || b.role)
          if (priorityA !== priorityB) return priorityA - priorityB
          return a.name.localeCompare(b.name)
        })

        const teamData = members.length > 0 ? members : fallbackTeamMembers
        console.log(teamData)
        setTeamMembers(teamData)
      } catch (error) {
        console.error('Error fetching team members:', error)
        const teamData = fallbackTeamMembers
        console.log(teamData)
        setTeamMembers(teamData)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  return (
    <div className="min-h-screen pt-0">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-black text-gray-900 dark:text-white section-padding overflow-hidden">
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="container-custom px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
              Meet Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Team</span>
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-300">
              The passionate individuals building the future of technical education
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="section-padding bg-transparent">
        <div className="container-custom px-6">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="glass-card p-8 text-center animate-pulse">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-xl bg-white/20 dark:bg-white/10" />
                  <div className="h-7 w-2/3 mx-auto rounded bg-white/20 dark:bg-white/10 mb-3" />
                  <div className="h-5 w-1/2 mx-auto rounded bg-white/15 dark:bg-white/5 mb-3" />
                  <div className="h-4 w-1/3 mx-auto rounded bg-white/10 dark:bg-white/5" />
                </div>
              ))}
            </div>
          ) : teamMembers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
              {teamMembers.map((member, index) => {
                const showProfileImage = Boolean(member.profileImage) && !imageErrorMap[member.employeeId]
                return (
                  <motion.div
                    key={member.employeeId}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.5 }}
                    className="glass-card p-8 hover-lift hover-glow text-center"
                  >
                    {/* Avatar - Image with fallback to initials */}
                    <div className="relative w-32 h-32 mx-auto mb-6 rounded-xl overflow-hidden 
                                  bg-gradient-to-br from-blue-500 to-purple-600">
                      {showProfileImage ? (
                        <img
                          src={member.profileImage}
                          alt={member.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={() => {
                            setImageErrorMap((prev) => ({
                              ...prev,
                              [member.employeeId]: true,
                            }))
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">
                          {getInitials(member.name)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                      {member.name}
                    </h3>
                    <p className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 font-medium mb-2">
                      {getDisplayRole(member)}
                    </p>
                    {member.department && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                        {member.department}
                      </p>
                    )}

                    {/* Social Links */}
                    <div className="flex justify-center space-x-4 mt-4">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} LinkedIn`}
                          className="w-10 h-10 glass-chip flex items-center justify-center 
                                   hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 hover:text-white 
                                   transition-all duration-300 cursor-pointer relative z-10"
                        >
                          <FaLinkedin size={20} />
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          aria-label={`Email ${member.name}`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            window.location.href = `mailto:${member.email}`
                          }}
                          className="w-10 h-10 glass-chip flex items-center justify-center 
                                   hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-600 hover:text-white 
                                   transition-all duration-300 cursor-pointer relative z-10"
                        >
                          <FaEnvelope size={20} />
                        </a>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="glass-card max-w-2xl mx-auto p-10 text-center">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Team details are currently unavailable. Please check back shortly.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="section-padding bg-white/30 dark:bg-white/[0.01] backdrop-blur-sm">
        <div className="container-custom px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center glass-card p-12 max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 gradient-text">
              Want to Join Our Team?
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              We&apos;re always looking for talented individuals who share our passion for education and technology.
            </p>
            <Link href="/careers">
              <button className="btn-primary">
                View Open Positions
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
