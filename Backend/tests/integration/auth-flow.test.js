import test, { after, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import request from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import fs from 'node:fs/promises'
import app from '../../src/app.js'
import User from '../../src/models/User.model.js'

let mongoServer

const testDir = dirname(fileURLToPath(import.meta.url))
const outboxDir = resolve(testDir, '../../test-outbox/auth-flow')

const readOutboxFiles = async () => {
  try {
    return await fs.readdir(outboxDir)
  } catch {
    return []
  }
}

const readLatestEmailByType = async (type) => {
  const files = (await readOutboxFiles()).filter((file) => file.includes(`-${type}-`))

  if (files.length === 0) {
    return null
  }

  files.sort()
  const filePath = resolve(outboxDir, files[files.length - 1])
  const content = await fs.readFile(filePath, 'utf8')
  return JSON.parse(content)
}

const login = async ({ email, password, role }) => {
  const response = await request(app).post('/api/auth/login').send({ email, password, role })
  assert.equal(response.status, 200)
  assert.equal(response.body.success, true)
  return response.body.data.token
}

before(async () => {
  process.env.JWT_SECRET = 'test-secret-key'
  process.env.JWT_EXPIRES_IN = '1h'
  process.env.CLIENT_URL = 'http://localhost:5173'
  process.env.ADMIN_SETUP_TOKEN = 'bootstrap-token'
  process.env.EMAIL_MODE = 'file'
  process.env.EMAIL_OUTBOX_DIR = outboxDir
  process.env.ENABLE_BACKGROUND_JOBS = 'false'

  await fs.rm(resolve(testDir, '../../test-outbox'), { recursive: true, force: true })
  await fs.mkdir(outboxDir, { recursive: true })

  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri(), { dbName: 'pims-auth-tests' })
})

after(async () => {
  await mongoose.disconnect()
  if (mongoServer) {
    await mongoServer.stop()
  }
  await fs.rm(resolve(testDir, '../../test-outbox'), { recursive: true, force: true })
})

beforeEach(async () => {
  await User.deleteMany({})
  await fs.rm(outboxDir, { recursive: true, force: true })
  await fs.mkdir(outboxDir, { recursive: true })
})

test('bootstraps the first admin only once', async () => {
  const setupResponse = await request(app).post('/api/auth/setup-admin').send({
    setupToken: 'bootstrap-token',
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@example.com',
    password: 'Secret123!',
    confirmPassword: 'Secret123!',
  })

  assert.equal(setupResponse.status, 201)
  assert.equal(setupResponse.body.success, true)
  assert.equal(setupResponse.body.data.user.role, 'ADMIN')

  const secondResponse = await request(app).post('/api/auth/setup-admin').send({
    setupToken: 'bootstrap-token',
    firstName: 'Another',
    lastName: 'Admin',
    email: 'other@example.com',
    password: 'Secret123!',
  })

  assert.equal(secondResponse.status, 409)
  assert.equal(secondResponse.body.success, false)
})

test('admin can create users and login with supplied password', async () => {
  await request(app).post('/api/auth/setup-admin').send({
    setupToken: 'bootstrap-token',
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@example.com',
    password: 'Secret123!',
  })

  const adminToken = await login({ email: 'admin@example.com', password: 'Secret123!', role: 'ADMIN' })

  const createResponse = await request(app)
    .post('/api/users')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      firstName: 'Jane',
      lastName: 'Doctor',
      email: 'doctor@example.com',
      password: 'Doctor123!',
      role: 'DOCTOR',
      isActive: true,
    })

  assert.equal(createResponse.status, 201)
  assert.equal(createResponse.body.data.user.role, 'DOCTOR')
  assert.equal(createResponse.body.data.user.email, 'doctor@example.com')

  const inviteEmail = await readLatestEmailByType('invite')
  assert.ok(inviteEmail)
  assert.equal(inviteEmail.to, 'doctor@example.com')
  assert.match(String(inviteEmail.text), /Doctor123!/)

  const doctorToken = await login({ email: 'doctor@example.com', password: 'Doctor123!', role: 'DOCTOR' })
  assert.ok(doctorToken)
})

test('authenticated users can change password and old token becomes invalid', async () => {
  await request(app).post('/api/auth/setup-admin').send({
    setupToken: 'bootstrap-token',
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@example.com',
    password: 'Secret123!',
  })

  const adminToken = await login({ email: 'admin@example.com', password: 'Secret123!', role: 'ADMIN' })

  const changeResponse = await request(app)
    .put('/api/auth/change-password')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      currentPassword: 'Secret123!',
      newPassword: 'Secret456!',
      confirmPassword: 'Secret456!',
    })

  assert.equal(changeResponse.status, 200)
  assert.equal(changeResponse.body.success, true)

  const oldTokenResponse = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${adminToken}`)

  assert.equal(oldTokenResponse.status, 401)

  const newToken = changeResponse.body.data.token
  const meResponse = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${newToken}`)
  assert.equal(meResponse.status, 200)

  const changedEmail = await readLatestEmailByType('password-changed')
  assert.ok(changedEmail)
  assert.equal(changedEmail.to, 'admin@example.com')
})

test('forgot-password and reset-password complete the reset flow', async () => {
  await request(app).post('/api/auth/setup-admin').send({
    setupToken: 'bootstrap-token',
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@example.com',
    password: 'Secret123!',
  })

  const forgotResponse = await request(app).post('/api/auth/forgot-password').send({
    email: 'admin@example.com',
  })

  assert.equal(forgotResponse.status, 200)

  const resetEmail = await readLatestEmailByType('password-reset')
  assert.ok(resetEmail)
  assert.equal(resetEmail.to, 'admin@example.com')

  const tokenMatch = String(resetEmail.text).match(/Reset code: ([a-f0-9]+)/i)
  assert.ok(tokenMatch)
  const resetToken = tokenMatch[1]

  const resetResponse = await request(app).post('/api/auth/reset-password').send({
    email: 'admin@example.com',
    token: resetToken,
    newPassword: 'Secret789!',
    confirmPassword: 'Secret789!',
  })

  assert.equal(resetResponse.status, 200)
  assert.equal(resetResponse.body.success, true)

  const newLoginToken = await login({ email: 'admin@example.com', password: 'Secret789!', role: 'ADMIN' })
  assert.ok(newLoginToken)
})