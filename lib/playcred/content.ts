// ============================================================
// PlayCred™ credential templates — one per GrowGrid path. When a user
// completes every module in a path, the matching credential is minted.
// ============================================================

import { CredentialRarity } from './types'

export interface CredentialTemplate {
  pathId: string
  title: string
  description: string
  category: string
  rarity: CredentialRarity
  colorFrom: string
  colorTo: string
  iconKey: 'trophy' | 'award' | 'star' | 'medal' | 'certificate' | 'shield'
}

export const CREDENTIAL_TEMPLATES: Record<string, CredentialTemplate> = {
  'web-dev': {
    pathId: 'web-dev',
    title: 'Full-Stack Web Developer',
    description: 'Completed the full-stack web development path, from HTML to a deployed Node backend.',
    category: 'Programming',
    rarity: 'legendary',
    colorFrom: 'from-blue-400',
    colorTo: 'to-cyan-500',
    iconKey: 'trophy',
  },
  'ui-design': {
    pathId: 'ui-design',
    title: 'UI/UX Design Specialist',
    description: 'Mastered design principles, research, prototyping, and design systems.',
    category: 'Design',
    rarity: 'epic',
    colorFrom: 'from-purple-400',
    colorTo: 'to-pink-500',
    iconKey: 'certificate',
  },
  'data-science': {
    pathId: 'data-science',
    title: 'Data Science Practitioner',
    description: 'Completed Python, visualization, machine learning, and deep learning foundations.',
    category: 'Data',
    rarity: 'legendary',
    colorFrom: 'from-green-400',
    colorTo: 'to-emerald-500',
    iconKey: 'star',
  },
}

export function getCredentialTemplate(pathId: string): CredentialTemplate | undefined {
  return CREDENTIAL_TEMPLATES[pathId]
}
