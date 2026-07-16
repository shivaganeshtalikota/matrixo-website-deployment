// ============================================================
// PlayCred™ — verifiable achievement credentials.
//
// HONEST DESIGN NOTE: these are matriXO-issued, tamper-EVIDENT
// credentials, not on-chain tokens. Each credential carries a SHA-256
// integrity hash over its canonical fields so the public verification
// page can prove the record was not altered after issuance, and the
// collection is immutable (no update/delete) per the security rules.
//
// Credentials are earned by real platform activity (completing a
// GrowGrid learning path), not self-declared. Full anti-forgery
// (server-authoritative issuance signed with a server key via the
// Admin SDK) is the documented hardening step — see service.ts.
// ============================================================

export type CredentialRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface PlayCredCredential {
  id?: string
  userId: string
  ownerName: string
  pathId: string
  title: string
  description: string
  category: string
  rarity: CredentialRarity
  colorFrom: string
  colorTo: string
  iconKey: 'trophy' | 'award' | 'star' | 'medal' | 'certificate' | 'shield'
  issuedAt: number
  integrityHash: string
}

/**
 * The subset of fields the integrity hash is computed over. Anything a
 * verifier needs to trust must be in here.
 */
export interface CredentialCanonical {
  userId: string
  pathId: string
  title: string
  issuedAt: number
}
