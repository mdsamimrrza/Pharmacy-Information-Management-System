import crypto from 'node:crypto'

const HASH_ITERATIONS = 210000
const HASH_KEY_LENGTH = 64
const HASH_DIGEST = 'sha512'

export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = crypto
    .pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_DIGEST)
    .toString('hex')

  return `${salt}:${derivedKey}`
}

export const verifyPassword = (password, storedHash) => {
  if (!password || !storedHash) {
    return false
  }

  const [salt, expectedHash] = storedHash.split(':')

  if (!salt || !expectedHash) {
    return false
  }

  const actualHash = crypto
    .pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_DIGEST)
    .toString('hex')

  if (actualHash.length !== expectedHash.length) {
    return false
  }

  return crypto.timingSafeEqual(Buffer.from(actualHash, 'hex'), Buffer.from(expectedHash, 'hex'))
}

export const generatePassword = (length = 14) => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*?-_'
  const bytes = crypto.randomBytes(length)

  let password = ''
  for (let index = 0; index < length; index += 1) {
    password += alphabet[bytes[index] % alphabet.length]
  }

  return password
}

export const generateToken = (length = 32) => crypto.randomBytes(length).toString('hex')

export const hashToken = (value) =>
  crypto.createHash('sha256').update(String(value || '')).digest('hex')
