// ============================================================
// GrowGrid™ curriculum — the catalog of paths and modules.
//
// This is authored content (not user data), so it lives in code rather
// than Firestore: versioned with the app, no read cost, no seeding step.
// The first modules of each path are `free`; deeper modules are `premium`
// and gated behind an active GrowGrid entitlement.
// ============================================================

import { GrowGridPath } from './types'

export const GROWGRID_PATHS: GrowGridPath[] = [
  {
    id: 'web-dev',
    name: 'Full-Stack Web Development',
    description: 'Go from first HTML tag to shipping a full-stack app.',
    color: 'from-blue-500 to-cyan-500',
    iconKey: 'code',
    estimatedTime: '8 weeks',
    modules: [
      {
        id: 'web-html-css',
        title: 'HTML & CSS Fundamentals',
        description: 'The building blocks of every web page.',
        duration: '2 hours',
        minutes: 120,
        difficulty: 'beginner',
        tier: 'free',
        xp: 200,
        lessons: ['Semantic HTML', 'The box model', 'Flexbox & grid', 'Responsive design'],
      },
      {
        id: 'web-js-basics',
        title: 'JavaScript Basics',
        description: 'Variables, functions, and the DOM.',
        duration: '3 hours',
        minutes: 180,
        difficulty: 'beginner',
        tier: 'free',
        xp: 250,
        lessons: ['Types & scope', 'Functions & closures', 'DOM manipulation', 'Events'],
      },
      {
        id: 'web-react',
        title: 'React Framework',
        description: 'Build dynamic, component-driven UIs.',
        duration: '4 hours',
        minutes: 240,
        difficulty: 'intermediate',
        tier: 'premium',
        xp: 350,
        lessons: ['JSX & components', 'State & props', 'Hooks', 'Data fetching'],
      },
      {
        id: 'web-next',
        title: 'Next.js & Server Components',
        description: 'Production React with the App Router.',
        duration: '5 hours',
        minutes: 300,
        difficulty: 'intermediate',
        tier: 'premium',
        xp: 400,
        lessons: ['App Router', 'Server vs client', 'Routing & layouts', 'API routes'],
      },
      {
        id: 'web-node',
        title: 'Backend with Node.js',
        description: 'APIs, auth, and server architecture.',
        duration: '6 hours',
        minutes: 360,
        difficulty: 'advanced',
        tier: 'premium',
        xp: 450,
        lessons: ['Express & routing', 'Auth & sessions', 'Validation', 'Deployment'],
      },
      {
        id: 'web-db',
        title: 'Database Design & SQL',
        description: 'Model, store, and query data effectively.',
        duration: '4 hours',
        minutes: 240,
        difficulty: 'advanced',
        tier: 'premium',
        xp: 400,
        lessons: ['Relational modeling', 'SQL joins', 'Indexes', 'NoSQL basics'],
      },
    ],
  },
  {
    id: 'ui-design',
    name: 'UI/UX Design Mastery',
    description: 'Design interfaces people love to use.',
    color: 'from-purple-500 to-pink-500',
    iconKey: 'palette',
    estimatedTime: '6 weeks',
    modules: [
      {
        id: 'ux-principles',
        title: 'Design Principles',
        description: 'Hierarchy, contrast, balance, and rhythm.',
        duration: '2 hours',
        minutes: 120,
        difficulty: 'beginner',
        tier: 'free',
        xp: 200,
        lessons: ['Visual hierarchy', 'Color theory', 'Typography', 'Spacing systems'],
      },
      {
        id: 'ux-research',
        title: 'User Research',
        description: 'Understand the humans you design for.',
        duration: '3 hours',
        minutes: 180,
        difficulty: 'intermediate',
        tier: 'premium',
        xp: 300,
        lessons: ['Interviews', 'Personas', 'Journey maps', 'Usability testing'],
      },
      {
        id: 'ux-figma',
        title: 'Prototyping in Figma',
        description: 'From wireframe to interactive prototype.',
        duration: '4 hours',
        minutes: 240,
        difficulty: 'intermediate',
        tier: 'premium',
        xp: 350,
        lessons: ['Auto layout', 'Components & variants', 'Interactions', 'Handoff'],
      },
      {
        id: 'ux-systems',
        title: 'Design Systems',
        description: 'Scale design with tokens and components.',
        duration: '4 hours',
        minutes: 240,
        difficulty: 'advanced',
        tier: 'premium',
        xp: 400,
        lessons: ['Design tokens', 'Component APIs', 'Documentation', 'Governance'],
      },
    ],
  },
  {
    id: 'data-science',
    name: 'Data Science & Analytics',
    description: 'Turn raw data into decisions with AI and ML.',
    color: 'from-green-500 to-emerald-500',
    iconKey: 'chart',
    estimatedTime: '10 weeks',
    modules: [
      {
        id: 'ds-python',
        title: 'Python for Data',
        description: 'Pandas, NumPy, and clean pipelines.',
        duration: '3 hours',
        minutes: 180,
        difficulty: 'beginner',
        tier: 'free',
        xp: 250,
        lessons: ['Pandas basics', 'NumPy arrays', 'Data cleaning', 'Aggregation'],
      },
      {
        id: 'ds-viz',
        title: 'Data Visualization',
        description: 'Tell stories with charts that land.',
        duration: '3 hours',
        minutes: 180,
        difficulty: 'intermediate',
        tier: 'premium',
        xp: 300,
        lessons: ['Chart selection', 'Matplotlib', 'Dashboards', 'Narrative'],
      },
      {
        id: 'ds-ml',
        title: 'Machine Learning Foundations',
        description: 'Regression, classification, evaluation.',
        duration: '5 hours',
        minutes: 300,
        difficulty: 'advanced',
        tier: 'premium',
        xp: 450,
        lessons: ['Train/test split', 'Regression', 'Classification', 'Metrics'],
      },
      {
        id: 'ds-deep',
        title: 'Deep Learning Intro',
        description: 'Neural networks from the ground up.',
        duration: '6 hours',
        minutes: 360,
        difficulty: 'advanced',
        tier: 'premium',
        xp: 500,
        lessons: ['Perceptrons', 'Backprop', 'CNNs', 'Transfer learning'],
      },
    ],
  },
]

export function getPathById(id: string): GrowGridPath | undefined {
  return GROWGRID_PATHS.find((p) => p.id === id)
}

export function getAllModules() {
  return GROWGRID_PATHS.flatMap((p) => p.modules)
}

export function totalModuleCount(): number {
  return getAllModules().length
}
