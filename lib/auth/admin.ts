import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme'

export interface AdminSession {
  username: string
  isAdmin: boolean
  exp: number
}

/**
 * Check if the provided credentials match the admin credentials
 */
export async function checkAdminCredentials(
  username: string,
  password: string
): Promise<boolean> {
  if (username !== ADMIN_USERNAME) {
    return false
  }

  // For simplicity, compare password directly
  // In production, you should hash the password in .env and compare hashes
  return password === ADMIN_PASSWORD
}

/**
 * Create an admin session token (JWT)
 */
export async function createAdminSession(username: string): Promise<string> {
  const token = await new SignJWT({ username, isAdmin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  return token
}

/**
 * Verify an admin session token
 */
export async function verifyAdminSession(
  token: string
): Promise<AdminSession | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload as AdminSession
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Hash a password (for future use if needed)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Compare a password with a hash (for future use if needed)
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
