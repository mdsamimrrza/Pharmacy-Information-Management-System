import test, { after, before, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import request from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app from '../../src/app.js'
import User from '../../src/models/User.model.js'
import Patient from '../../src/models/Patient.model.js'
import Medicine from '../../src/models/Medicine.model.js'
import Inventory from '../../src/models/Inventory.model.js'
import Alert from '../../src/models/Alert.model.js'
import Prescription from '../../src/models/Prescription.model.js'
import ATCCode from '../../src/models/ATCCode.model.js'
import atcSeedDocs from '../../src/data/atc.seed.js'
import { hashPassword } from '../../src/utils/password.js'

let mongoServer

const seedUsers = async () => {
  const password = 'Passw0rd!'

  const [doctor, admin] = await User.create([
    {
      firstName: 'Doc',
      lastName: 'One',
      email: 'doc1@example.com',
      passwordHash: hashPassword(password),
      role: 'DOCTOR',
      isActive: true,
    },
    {
      firstName: 'Admin',
      lastName: 'One',
      email: 'admin@example.com',
      passwordHash: hashPassword(password),
      role: 'ADMIN',
      isActive: true,
    },
  ])

  return {
    doctor,
    admin,
    password,
  }
}

const login = async ({ email, password, role }) => {
  const response = await request(app).post('/api/auth/login').send({ email, password, role })
  assert.equal(response.status, 200)
  return response.body.data.token
}

before(async () => {
  process.env.JWT_SECRET = 'test-secret-key'
  process.env.JWT_EXPIRES_IN = '1h'
  process.env.EMAIL_MODE = 'disabled'
  process.env.ENABLE_BACKGROUND_JOBS = 'false'

  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri(), { dbName: 'pims-backend-tests' })
})

after(async () => {
  await mongoose.disconnect()
  if (mongoServer) {
    await mongoServer.stop()
  }
})

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Medicine.deleteMany({}),
    Inventory.deleteMany({}),
    Alert.deleteMany({}),
    Prescription.deleteMany({}),
    ATCCode.deleteMany({}),
  ])
})

test('ATC endpoints return tree, node detail, and search results from seeded DB data', async () => {
  const { doctor, password } = await seedUsers()
  await ATCCode.insertMany(atcSeedDocs)
  await Medicine.create([
    {
      name: 'Metformin HCl',
      genericName: 'Metformin',
      brand: 'Glucophage',
      atcCode: 'A10BA02',
      strength: '500mg',
      dosageForm: 'Tablet',
      manufacturer: 'Merck',
      mrp: 42,
    },
    {
      name: 'Insulin Glargine',
      genericName: 'Insulin Glargine',
      brand: 'Lantus',
      atcCode: 'A10AE04',
      strength: '100 IU/mL',
      dosageForm: 'Injection',
      manufacturer: 'Sanofi',
      mrp: 820,
    },
  ])

  const token = await login({ email: doctor.email, password, role: 'DOCTOR' })

  const treeResponse = await request(app)
    .get('/api/atc/tree')
    .set('Authorization', `Bearer ${token}`)

  assert.equal(treeResponse.status, 200)
  assert.equal(treeResponse.body.success, true)
  assert.ok(treeResponse.body.data.tree.length > 0)
  assert.equal(treeResponse.body.data.tree[0].level, 1)

  const nodeResponse = await request(app)
    .get('/api/atc/A10BA')
    .set('Authorization', `Bearer ${token}`)

  assert.equal(nodeResponse.status, 200)
  assert.equal(nodeResponse.body.data.node.code, 'A10BA')
  assert.equal(nodeResponse.body.data.node.children[0].code, 'A10BA02')

  const searchResponse = await request(app)
    .get('/api/atc/search?q=paracetamol')
    .set('Authorization', `Bearer ${token}`)

  assert.equal(searchResponse.status, 200)
  assert.ok(searchResponse.body.data.results.some((item) => item.code === 'N02BE01'))

  const descendantMedicineResponse = await request(app)
    .get('/api/medicines?atcCode=A10B&includeDescendants=true')
    .set('Authorization', `Bearer ${token}`)

  assert.equal(descendantMedicineResponse.status, 200)
  assert.equal(descendantMedicineResponse.body.data.pagination.total, 1)
  assert.equal(descendantMedicineResponse.body.data.medicines[0].atcCode, 'A10BA02')
})
