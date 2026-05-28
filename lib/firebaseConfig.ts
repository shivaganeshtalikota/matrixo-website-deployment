import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

type FirebaseBaseEnvKey =
  | 'NEXT_PUBLIC_FIREBASE_API_KEY'
  | 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'
  | 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  | 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'
  | 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'
  | 'NEXT_PUBLIC_FIREBASE_APP_ID'
  | 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID';

type FirebaseEnvKey = FirebaseBaseEnvKey | `${FirebaseBaseEnvKey}_BETA` | `${FirebaseBaseEnvKey}_MAIN`;

// IMPORTANT: Do not hardcode any Firebase keys here.
// Hardcoded API keys can be suspended/compromised and will silently break sign-in in production.
// Provide values via NEXT_PUBLIC_FIREBASE_* env vars instead.
const fallbackFirebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: ''
} as const;


const stripSurroundingQuotes = (value: string) => {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1).trim();
  }

  return value;
};

const readEnv = (key: string) => stripSurroundingQuotes(process.env[key]?.trim() || '');

const isPlaceholderValue = (value: string) => {
  const normalizedValue = value.toLowerCase();
  return (
    normalizedValue === '' ||
    normalizedValue.startsWith('your_') ||
    normalizedValue.includes('replace') ||
    normalizedValue.includes('changeme')
  );
};

const normalizeFirebaseEnvKey = (key: FirebaseEnvKey): FirebaseBaseEnvKey => {
  if (key.endsWith('_BETA') || key.endsWith('_MAIN')) {
    return key.slice(0, -5) as FirebaseBaseEnvKey;
  }
  return key as FirebaseBaseEnvKey;
};

const normalizeFirebaseValue = (key: FirebaseBaseEnvKey, value: string) => {
  switch (key) {
    case 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN':
    case 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET':
      return value.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    default:
      return value;
  }
};

const isValidFirebaseValue = (key: FirebaseBaseEnvKey, value: string) => {
  switch (key) {
    case 'NEXT_PUBLIC_FIREBASE_API_KEY':
      return /^AIza[0-9A-Za-z_-]{20,}$/.test(value);
    case 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN':
      return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(value);
    case 'NEXT_PUBLIC_FIREBASE_PROJECT_ID':
      return /^[a-z0-9-]{4,}$/i.test(value);
    case 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET':
      return /^[a-z0-9.-]+(\.appspot\.com|\.firebasestorage\.app)$/i.test(value);
    case 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID':
      return /^\d{6,}$/.test(value);
    case 'NEXT_PUBLIC_FIREBASE_APP_ID':
      return /^\d+:\d+:web:[a-z0-9]+$/i.test(value);
    case 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID':
      return /^G-[A-Z0-9]+$/i.test(value);
    default:
      return false;
  }
};

const readFirebaseEnv = (key: FirebaseEnvKey) => {
  const normalizedKey = normalizeFirebaseEnvKey(key);
  const value = normalizeFirebaseValue(normalizedKey, readEnv(key));

  if (isPlaceholderValue(value)) {
    return '';
  }

  return isValidFirebaseValue(normalizedKey, value) ? value : '';
};

const hostName = typeof window !== 'undefined' ? window.location.hostname : '';

const isBetaDeployment =
  hostName === 'beta.matrixo.in' ||
  process.env.NEXT_PUBLIC_SITE_MODE === 'beta' ||
  process.env.NEXT_PUBLIC_SITE_URL === 'https://beta.matrixo.in' ||
  process.env.NEXT_PUBLIC_VERCEL_URL?.includes('beta') === true;

const pickFirebaseEnv = (baseKey: FirebaseBaseEnvKey, fallbackValue: string) => {
  const betaKey = `${baseKey}_BETA` as FirebaseEnvKey;
  const mainKey = `${baseKey}_MAIN` as FirebaseEnvKey;
  const baseValue = readFirebaseEnv(baseKey);
  const betaValue = readFirebaseEnv(betaKey);
  const mainValue = readFirebaseEnv(mainKey);

  if (isBetaDeployment) {
    return betaValue || baseValue || mainValue || fallbackValue;
  }

  return mainValue || baseValue || betaValue || fallbackValue;
};

const firebaseConfig = {
  apiKey: pickFirebaseEnv('NEXT_PUBLIC_FIREBASE_API_KEY', fallbackFirebaseConfig.apiKey),
  authDomain: pickFirebaseEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', fallbackFirebaseConfig.authDomain),
  projectId: pickFirebaseEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', fallbackFirebaseConfig.projectId),
  storageBucket: pickFirebaseEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', fallbackFirebaseConfig.storageBucket),
  messagingSenderId: pickFirebaseEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', fallbackFirebaseConfig.messagingSenderId),
  appId: pickFirebaseEnv('NEXT_PUBLIC_FIREBASE_APP_ID', fallbackFirebaseConfig.appId),
  measurementId: pickFirebaseEnv('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', fallbackFirebaseConfig.measurementId)
};

const requiredFirebaseConfigKeys: Array<keyof typeof firebaseConfig> = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
];

const missingKeys = requiredFirebaseConfigKeys.filter((k) => !firebaseConfig[k]);

if (missingKeys.length > 0) {
  // Fail fast: without these, Firebase Auth/Google sign-in will not work.
  // More importantly, we do not want to silently fall back to any
  // hardcoded/suspended keys.
  // eslint-disable-next-line no-console
  console.error(
    `[firebaseConfig] Missing required env vars for Firebase (${missingKeys.join(', ')}). ` +
      'Set NEXT_PUBLIC_FIREBASE_* env vars (and the *_BETA variants if deploying to beta).'
  );
  throw new Error('[firebaseConfig] Missing required NEXT_PUBLIC_FIREBASE_* environment variables')
}

// Initialize Firebase (avoid re-initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firestore
export const db = getFirestore(app);

export { RecaptchaVerifier, signInWithPhoneNumber };
export type { ConfirmationResult };
export default app;
