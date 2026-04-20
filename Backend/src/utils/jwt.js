import jwt from 'jsonwebtoken'

const getSecret = () => {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET is required')
  }

  return secret
}

export const signToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  return jwt.sign(payload, getSecret(), {
    expiresIn,
    algorithm: 'HS256',
  })
}

export const signShortLivedToken = (payload, expiresIn = '15m') => {
  return jwt.sign(payload, getSecret(), {
    expiresIn,
    algorithm: 'HS256',
  })
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, getSecret(), { algorithms: ['HS256'] })
  } catch (error) {
    throw new Error(error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token')
  }
}

export const decodeToken = (token) => {
  const payload = jwt.decode(token)

  if (!payload) {
    throw new Error('Invalid token')
  }

  return payload
}
