// ============================================================
// MentorMatrix™ — the curated mentor network (seeded roster) and the
// deterministic match-scoring used to rank mentors for a user's focus.
// ============================================================

import { Mentor } from './types'

export const MENTOR_CATEGORIES = ['all', 'Development', 'Design', 'Data Science', 'Business', 'Cloud'] as const

export const MENTORS: Mentor[] = [
  {
    id: 'mentor1',
    name: 'Priya Sharma',
    title: 'Senior Full-Stack Developer',
    company: 'Google',
    avatar: '👩‍💻',
    expertise: ['React', 'Node.js', 'System Design', 'Career Growth'],
    category: 'Development',
    rating: 4.9,
    totalSessions: 156,
    responseTime: '< 2 hours',
    languages: ['English', 'Hindi'],
    about: 'Ex-Microsoft engineer with 8+ years experience. Passionate about mentoring aspiring developers.',
    pricePerSession: 2500,
    availability: 'available',
    social: { linkedin: 'priya-sharma', github: 'priyasharma', twitter: 'priya_codes' },
  },
  {
    id: 'mentor2',
    name: 'Rajesh Kumar',
    title: 'Principal UI/UX Designer',
    company: 'Adobe',
    avatar: '👨‍🎨',
    expertise: ['UI/UX Design', 'Figma', 'Design Systems', 'User Research'],
    category: 'Design',
    rating: 4.8,
    totalSessions: 203,
    responseTime: '< 3 hours',
    languages: ['English', 'Tamil'],
    about: 'Award-winning designer specializing in creating delightful user experiences.',
    pricePerSession: 3000,
    availability: 'available',
    social: { linkedin: 'rajesh-kumar-design', twitter: 'rajesh_ux' },
  },
  {
    id: 'mentor3',
    name: 'Ananya Reddy',
    title: 'Data Science Lead',
    company: 'Amazon',
    avatar: '👩‍🔬',
    expertise: ['Machine Learning', 'Python', 'AI', 'Data Analytics'],
    category: 'Data Science',
    rating: 5.0,
    totalSessions: 89,
    responseTime: '< 4 hours',
    languages: ['English', 'Telugu'],
    about: 'PhD in AI/ML. Helping students break into data science careers.',
    pricePerSession: 3500,
    availability: 'busy',
    social: { linkedin: 'ananya-reddy-ds', github: 'ananya-ml' },
  },
  {
    id: 'mentor4',
    name: 'Vikram Singh',
    title: 'Tech Startup Founder',
    company: 'Startup Mentor',
    avatar: '👨‍💼',
    expertise: ['Entrepreneurship', 'Product Strategy', 'Fundraising', 'Growth'],
    category: 'Business',
    rating: 4.7,
    totalSessions: 124,
    responseTime: '< 6 hours',
    languages: ['English', 'Punjabi'],
    about: 'Built 2 successful startups. Mentor at accelerators and founder communities.',
    pricePerSession: 5000,
    availability: 'available',
    social: { linkedin: 'vikram-singh-founder', twitter: 'vikram_startup' },
  },
  {
    id: 'mentor5',
    name: 'Sneha Patel',
    title: 'DevOps Architect',
    company: 'Microsoft',
    avatar: '👩‍💻',
    expertise: ['DevOps', 'Cloud (AWS/Azure)', 'Kubernetes', 'CI/CD'],
    category: 'Cloud',
    rating: 4.9,
    totalSessions: 142,
    responseTime: '< 3 hours',
    languages: ['English', 'Gujarati'],
    about: 'Cloud-native enthusiast helping teams scale infrastructure efficiently.',
    pricePerSession: 2800,
    availability: 'available',
    social: { linkedin: 'sneha-patel-devops', github: 'sneha-cloud' },
  },
  {
    id: 'mentor6',
    name: 'Arjun Mehta',
    title: 'Mobile App Developer',
    company: 'Meta',
    avatar: '👨‍💻',
    expertise: ['React Native', 'iOS', 'Android', 'Mobile Design'],
    category: 'Development',
    rating: 4.8,
    totalSessions: 178,
    responseTime: '< 2 hours',
    languages: ['English', 'Marathi'],
    about: 'Built apps used by millions. Specializing in cross-platform development.',
    pricePerSession: 2200,
    availability: 'booked',
    social: { linkedin: 'arjun-mehta-mobile', github: 'arjun-dev', twitter: 'arjun_mobile' },
  },
]

/**
 * Deterministic match score for a mentor given the user's selected focus.
 * Reflects real expertise overlap (not a fabricated fixed number):
 *   - base from rating (a 5.0 mentor starts higher)
 *   - bonus when the focus matches the mentor's category/expertise
 * Capped to [40, 99].
 */
export function matchScore(mentor: Mentor, focus: string): number {
  const base = Math.round((mentor.rating / 5) * 70) // 0-70 from rating
  let bonus = 0
  if (focus && focus !== 'all') {
    const f = focus.toLowerCase()
    if (mentor.category.toLowerCase() === f) bonus += 25
    if (mentor.expertise.some((e) => e.toLowerCase().includes(f))) bonus += 20
  } else {
    bonus += 20 // neutral boost when no specific focus
  }
  return Math.max(40, Math.min(99, base + bonus))
}
