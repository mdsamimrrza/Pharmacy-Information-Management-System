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
import { hashPassword } from '../../src/utils/password.js'

let mongoServer

const seedUsers = async () => {
  const password = 'Passw0rd!'

  const [doctorOne, doctorTwo, pharmacist, admin] = await User.create([
    {
      firstName: 'Doc',
      lastName: 'One',
      email: 'doc1@example.com',
      passwordHash: hashPassword(password),
      role: 'DOCTOR',
      isActive: true,
    },
    {
      firstName: 'Doc',
      lastName: 'Two',
      email: 'doc2@example.com',
      passwordHash: hashPassword(password),
      role: 'DOCTOR',
      isActive: true,
    },
    {
      firstName: 'Pharma',
      lastName: 'One',
      email: 'pharmacist@example.com',
      passwordHash: hashPassword(password),
      role: 'PHARMACIST',
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
    doctorOne,
    doctorTwo,
    pharmacist,
    admin,
    password,
  }
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
  ])
})

test('patients endpoint supports pagination and search for doctor role', async () => {
  const { doctorOne, password } = await seedUsers()

  await Patient.create([
    { patientId: 'P-001', name: 'Alice Walker', dob: '1992-02-10' },
    { patientId: 'P-002', name: 'Bob Stone', dob: '1990-05-01' },
    { patientId: 'P-003', name: 'Alicia Keys', dob: '1985-12-20' },
  ])

  const token = await login({ email: doctorOne.email, password, role: 'DOCTOR' })

  const pagedResponse = await request(app)
    .get('/api/patients?page=1&limit=2')
    .set('Authorization', `Bearer ${token}`)

  assert.equal(pagedResponse.status, 200)
  assert.equal(pagedResponse.body.success, true)
  assert.equal(pagedResponse.body.data.patients.length, 2)
  assert.equal(pagedResponse.body.data.pagination.page, 1)
  assert.equal(pagedResponse.body.data.pagination.limit, 2)
  assert.equal(pagedResponse.body.data.pagination.total, 3)

  const searchResponse = await request(app)
    .get('/api/patients?q=alice&limit=10')
    .set('Authorization', `Bearer ${token}`)

  assert.equal(searchResponse.status, 200)
  assert.equal(searchResponse.body.data.pagination.total, 1)
  assert.equal(searchResponse.body.data.patients[0].name, 'Alice Walker')
})

test('inventory endpoint supports pagination and status filter for pharmacist role', async () => {
  const { pharmacist, password } = await seedUsers()

  const [medOne, medTwo] = await Medicine.create([
    { name: 'Amoxicillin 500', genericName: 'Amoxicillin', atcCode: 'J01CA04' },
    { name: 'Paracetamol 500', genericName: 'Paracetamol', atcCode: 'N02BE01' },
  ])

  await Inventory.create([
    {
      medicineId: medOne._id,
      atcCode: medOne.atcCode,
      batchId: 'B-001',
      currentStock: 4,
      threshold: 10,
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: 'LOW STOCK',
    },
    {
      medicineId: medTwo._id,
      atcCode: medTwo.atcCode,
      batchId: 'B-002',
      currentStock: 35,
      threshold: 10,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: 'STABLE',
    },
  ])

  const token = await login({ email: pharmacist.email, password, role: 'PHARMACIST' })

  const pagedResponse = await request(app)
    .get('/api/inventory?page=2&limit=1')
    .set('Authorization', `Bearer ${token}`)

  assert.equal(pagedResponse.status, 200)
  assert.equal(pagedResponse.body.data.inventory.length, 1)
  assert.equal(pagedResponse.body.data.pagination.page, 2)
  assert.equal(pagedResponse.body.data.pagination.total, 2)

  const filteredResponse = await request(app)
    .get('/api/inventory?status=LOW%20STOCK')
    .set('Authorization', `Bearer ${token}`)

  assert.equal(filteredResponse.status, 200)
  assert.equal(filteredResponse.body.data.pagination.total, 1)
  assert.equal(filteredResponse.body.data.inventory[0].status, 'LOW STOCK')
})

test('alerts endpoint paginates and excludes acknowledged alerts by default', async () => {
  const { pharmacist, password } = await seedUsers()

  const medicine = await Medicine.create({
    name: 'Metformin 500',
    genericName: 'Metformin',
    atcCode: 'A10BA02',
  })

  await Alert.create([
    {
      type: 'LOW_STOCK',
      severity: 'CRITICAL',
      medicineId: medicine._id,
      message: 'Low stock alert',
      isAcknowledged: false,
    },
    {
      type: 'NEAR_EXPIRY',
      severity: 'WARNING',
      medicineId: medicine._id,
      message: 'Near expiry alert',
      isAcknowledged: true,
      acknowledgedBy: pharmacist._id,
    },
  ])

  const token = await login({ email: pharmacist.email, password, role: 'PHARMACIST' })

  const defaultResponse = await request(app)
    .get('/api/alerts?page=1&limit=10')
    .set('Authorization', `Bearer ${token}`)

  assert.equal(defaultResponse.status, 200)
  assert.equal(defaultResponse.body.data.pagination.total, 1)
  assert.equal(defaultResponse.body.data.alerts[0].isAcknowledged, false)

  const inclusiveResponse = await request(app)
    .get('/api/alerts?includeAcknowledged=true')
    .set('Authorization', `Bearer ${token}`)

  assert.equal(inclusiveResponse.status, 200)
  assert.equal(inclusiveResponse.body.data.pagination.total, 2)
})

test('prescriptions endpoint paginates and enforces doctor-scoped listing', async () => {
  const { doctorOne, doctorTwo, password } = await seedUsers()

  const patient = await Patient.create({
    patientId: 'P-009',
    name: 'Chris Newton',
    dob: '1997-01-01',
  })

  await Prescription.create([
    {
      rxId: 'RX-9001',
      patientId: patient._id,
      doctorId: doctorOne._id,
      diagnosis: 'Flu',
      items: [{ atcCode: 'J01CA04', dose: '500mg', frequency: 'TID' }],
      status: 'Pending',
    },
    {
      rxId: 'RX-9002',
      patientId: patient._id,
      doctorId: doctorOne._id,
      diagnosis: 'Fever',
      items: [{ atcCode: 'N02BE01', dose: '500mg', frequency: 'BID' }],
      status: 'Processing',
    },
    {
      rxId: 'RX-9003',
      patientId: patient._id,
      doctorId: doctorTwo._id,
      diagnosis: 'Migraine',
      items: [{ atcCode: 'N02BE01', dose: '500mg', frequency: 'OD' }],
      status: 'Filled',
    },
  ])

  const token = await login({ email: doctorOne.email, password, role: 'DOCTOR' })

  const pagedResponse = await request(app)
    .get('/api/prescriptions?page=1&limit=1')
    .set('Authorization', `Bearer ${token}`)

  assert.equal(pagedResponse.status, 200)
  assert.equal(pagedResponse.body.data.prescriptions.length, 1)
  assert.equal(pagedResponse.body.data.pagination.total, 2)
  assert.equal(pagedResponse.body.data.pagination.totalPages, 2)

  const statusResponse = await request(app)
    .get('/api/prescriptions?status=Processing')
    .set('Authorization', `Bearer ${token}`)

  assert.equal(statusResponse.status, 200)
  assert.equal(statusResponse.body.data.pagination.total, 1)
  assert.equal(statusResponse.body.data.prescriptions[0].status, 'Processing')
})
