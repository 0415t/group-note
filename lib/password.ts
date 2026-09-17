import crypto from 'node:crypto'

const PBKDF2_PREFIX = 'pbkdf2_sha256'
const ITERATIONS = 200_000
const KEY_LENGTH = 32
const DIGEST = 'sha256'

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex')
  return `${PBKDF2_PREFIX}$${ITERATIONS}$${salt}$${hash}`
}

export function verifyPassword(password: string, storedHash: string | null | undefined): boolean {
  if (!storedHash) return false

  if (!storedHash.startsWith(`${PBKDF2_PREFIX}$`)) {
    return storedHash === password
  }

  const parts = storedHash.split('$')
  if (parts.length !== 4) return false

  const [, iterationsText, salt, expectedHash] = parts
  const iterations = Number(iterationsText)

  if (!salt || !expectedHash || Number.isNaN(iterations)) {
    return false
  }

  const derivedHash = crypto
    .pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST)
    .toString('hex')

  const expected = Buffer.from(expectedHash, 'hex')
  const actual = Buffer.from(derivedHash, 'hex')

  if (expected.length !== actual.length) return false

  return crypto.timingSafeEqual(expected, actual)
}
