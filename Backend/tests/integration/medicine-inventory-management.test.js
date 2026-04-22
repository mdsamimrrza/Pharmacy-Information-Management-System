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

  const [doctor, pharmacist, admin] = await User.create([
    {
      firstName: 'Doc',
      lastName: 'One',
      email: 'doc1@example.com',
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
    doctor,
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

test('medicines support pharmacist creation, shared listing, and admin-only update/delete', async () => {
  const { doctor, pharmacist, admin, password } = await seedUsers()
  const pharmacistToken = await login({ email: pharmacist.email, password, role: 'PHARMACIST' })
  const adminToken = await login({ email: admin.email, password, role: 'ADMIN' })
  const doctorToken = await login({ email: doctor.email, password, role: 'DOCTOR' })

  const createResponse = await request(app)
    .post('/api/medicines')
    .set('Authorization', `Bearer ${pharmacistToken}`)
    .send({
      name: 'Amoxicillin 500',
      genericName: 'Amoxicillin',
      brand: 'Amoxil',
      atcCode: 'j01ca04',
      strength: '500mg',
      dosageForm: 'Capsule',
      manufacturer: 'Demo Pharma',
      mrp: 99,
    })

  assert.equal(createResponse.status, 201)
  assert.equal(createResponse.body.data.medicine.atcCode, 'J01CA04')
  const medicineId = createResponse.body.data.medicine._id

  const listResponse = await request(app)
    .get('/api/medicines?q=amoxi')
    .set('Authorization', `Bearer ${doctorToken}`)

  assert.equal(listResponse.status, 200)
  assert.equal(listResponse.body.data.pagination.total, 1)
  assert.equal(listResponse.body.data.medicines[0]._id, medicineId)

  const getResponse = await request(app)
    .get(`/api/medicines/${medicineId}`)
    .set('Authorization', `Bearer ${doctorToken}`)

  assert.equal(getResponse.status, 200)
  assert.equal(getResponse.body.data.medicine.brand, 'Amoxil')

  const forbiddenUpdateResponse = await request(app)
    .put(`/api/medicines/${medicineId}`)
    .set('Authorization', `Bearer ${pharmacistToken}`)
    .send({ brand: 'Updated Brand' })

  assert.equal(forbiddenUpdateResponse.status, 403)

  const updateResponse = await request(app)
    .put(`/api/medicines/${medicineId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ brand: 'Updated Brand', mrp: 120 })

  assert.equal(updateResponse.status, 200)
  assert.equal(updateResponse.body.data.medicine.brand, 'Updated Brand')
  assert.equal(updateResponse.body.data.medicine.mrp, 120)

  const duplicateResponse = await request(app)
    .post('/api/medicines')
    .set('Authorization', `Bearer ${pharmacistToken}`)
    .send({
      name: 'Amoxicillin 500',
      genericName: 'Amoxicillin',
      brand: 'Updated Brand',
      atcCode: 'J01CA04',
      strength: '500mg',
      dosageForm: 'Capsule',
      manufacturer: 'Demo Pharma',
      mrp: 120,
    })

  assert.equal(duplicateResponse.status, 409)

  const deleteResponse = await request(app)
    .delete(`/api/medicines/${medicineId}`)
    .set('Authorization', `Bearer ${adminToken}`)

  assert.equal(deleteResponse.status, 200)

  const deletedGetResponse = await request(app)
    .get(`/api/medicines/${medicineId}`)
    .set('Authorization', `Bearer ${doctorToken}`)

  assert.equal(deletedGetResponse.status, 404)
})

test('inventory supports create, update, duplicate protection, audit summary, and delete flows', async () => {
  const { pharmacist, admin, password } = await seedUsers()
  const pharmacistToken = await login({ email: pharmacist.email, password, role: 'PHARMACIST' })
  const adminToken = await login({ email: admin.email, password, role: 'ADMIN' })

  const medicine = await Medicine.create({
    name: 'Paracetamol 500',
    genericName: 'Paracetamol',
    brand: 'PCM',
    atcCode: 'N02BE01',
    strength: '500mg',
    dosageForm: 'Tablet',
    mrp: 10,
  })

  const createResponse = await request(app)
    .post('/api/inventory')
    .set('Authorization', `Bearer ${pharmacistToken}`)
    .send({
      medicineId: medicine._id.toString(),
      batchId: 'B-100',
      currentStock: 4,
      threshold: 10,
      expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      storage: 'Room shelf',
    })

  assert.equal(createResponse.status, 201)
  assert.equal(createResponse.body.data.item.status, 'LOW STOCK')
  assert.equal(createResponse.body.data.item.atcCode, 'N02BE01')
  const inventoryId = createResponse.body.data.item._id

  const duplicateCreateResponse = await request(app)
    .post('/api/inventory')
    .set('Authorization', `Bearer ${pharmacistToken}`)
    .send({
      medicineId: medicine._id.toString(),
      batchId: 'B-100',
      currentStock: 15,
      threshold: 10,
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    })

  assert.equal(duplicateCreateResponse.status, 409)

  const listResponse = await request(app)
    .get(`/api/inventory?medicineId=${medicine._id}`)
    .set('Authorization', `Bearer ${pharmacistToken}`)

  assert.equal(listResponse.status, 200)
  assert.equal(listResponse.body.data.pagination.total, 1)
  assert.equal(listResponse.body.data.inventory[0]._id, inventoryId)

  const updateResponse = await request(app)
    .put(`/api/inventory/${inventoryId}`)
    .set('Authorization', `Bearer ${pharmacistToken}`)
    .send({
      currentStock: 30,
      threshold: 10,
      storage: 'Cold room',
    })

  assert.equal(updateResponse.status, 200)
  assert.equal(updateResponse.body.data.item.status, 'STABLE')
  assert.equal(updateResponse.body.data.item.storage, 'Cold room')

  const auditResponse = await request(app)
    .get('/api/inventory/audit')
    .set('Authorization', `Bearer ${adminToken}`)

  assert.equal(auditResponse.status, 200)
  assert.equal(auditResponse.body.data.items.length, 1)
  assert.equal(auditResponse.body.data.summary.totalItems, 1)
  assert.equal(auditResponse.body.data.summary.totalUnits, 30)
  assert.equal(auditResponse.body.data.summary.inventoryValue, 300)

  const deleteResponse = await request(app)
    .delete(`/api/inventory/${inventoryId}`)
    .set('Authorization', `Bearer ${pharmacistToken}`)

  assert.equal(deleteResponse.status, 200)

  const listAfterDeleteResponse = await request(app)
    .get('/api/inventory')
    .set('Authorization', `Bearer ${pharmacistToken}`)

  assert.equal(listAfterDeleteResponse.status, 200)
  assert.equal(listAfterDeleteResponse.body.data.pagination.total, 0)
})

test('inventory and medicine role restrictions are enforced for non-authorized users', async () => {
  const { doctor, pharmacist, admin, password } = await seedUsers()
  const doctorToken = await login({ email: doctor.email, password, role: 'DOCTOR' })
  const adminToken = await login({ email: admin.email, password, role: 'ADMIN' })

  const medicine = await Medicine.create({
    name: 'Metformin 500',
    genericName: 'Metformin',
    atcCode: 'A10BA02',
  })

  const doctorInventoryCreate = await request(app)
    .post('/api/inventory')
    .set('Authorization', `Bearer ${doctorToken}`)
    .send({
      medicineId: medicine._id.toString(),
      batchId: 'B-401',
      currentStock: 12,
      threshold: 5,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })

  assert.equal(doctorInventoryCreate.status, 403)

  const adminInventoryList = await request(app)
    .get('/api/inventory')
    .set('Authorization', `Bearer ${adminToken}`)

  assert.equal(adminInventoryList.status, 403)

  const doctorMedicineCreate = await request(app)
    .post('/api/medicines')
    .set('Authorization', `Bearer ${doctorToken}`)
    .send({
      name: 'Ibuprofen 400',
      genericName: 'Ibuprofen',
      atcCode: 'M01AE01',
    })

  assert.equal(doctorMedicineCreate.status, 403)
})
