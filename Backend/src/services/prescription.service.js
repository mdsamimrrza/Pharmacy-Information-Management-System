import mongoose from 'mongoose'
import Patient from '../models/Patient.model.js'
import Prescription from '../models/Prescription.model.js'
import Medicine from '../models/Medicine.model.js'
import User from '../models/User.model.js'
import { sendPrescriptionNotificationEmail } from './email.service.js'
import { ROLES } from '../utils/constants.js'
import { buildPagination, getPagination } from '../utils/pagination.js'

const PRESCRIPTION_STATUSES = ['Pending', 'Processing', 'Filled', 'Cancelled']
const PHARMACIST_ALLOWED_STATUSES = ['Processing', 'Filled', 'Cancelled']

const prescriptionNotFound = () => {
  const error = new Error('Prescription not found')
  error.statusCode = 404
  return error
}

const validationError = (message) => {
  const error = new Error(message)
  error.statusCode = 400
  return error
}

const forbiddenError = (message) => {
  const error = new Error(message)
  error.statusCode = 403
  return error
}

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const ensureObjectId = (value, label) => {
  if (!mongoose.isValidObjectId(value)) {
    throw validationError(`Invalid ${label}`)
  }
}

const generateRxId = async () => {
  const total = await Prescription.countDocuments()
  return `RX-${String(total + 9001).padStart(4, '0')}`
}

const buildDigitalSignature = (doctor) => {
  const nameSeed = String(doctor?.lastName || doctor?.firstName || 'PIMS')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(0, 6) || 'PIMS'

  return `DSIG-${nameSeed}-${Date.now().toString().slice(-4)}`
}

const normalizeAtcCode = (value) => String(value || '').trim().toUpperCase()

const normalizePrescriptionItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw validationError('At least one prescription item is required')
  }

  const normalizedItems = []

  for (const item of items) {
    if (!item?.dose || !item?.frequency) {
      throw validationError('Each prescription item requires dose and frequency')
    }

    let medicine = null

    if (item.medicineId) {
      ensureObjectId(item.medicineId, 'medicineId')
      medicine = await Medicine.findById(item.medicineId)

      if (!medicine) {
        throw validationError('Referenced medicine not found')
      }
    }

    const atcCode = normalizeAtcCode(item.atcCode || medicine?.atcCode)

    if (!atcCode) {
      throw validationError('Each prescription item requires an atcCode or valid medicineId')
    }

    normalizedItems.push({
      medicineId: medicine?._id || null,
      atcCode,
      dose: String(item.dose).trim(),
      frequency: String(item.frequency).trim(),
      route: String(item.route || 'Oral').trim(),
      durationDays: Number(item.durationDays) > 0 ? Number(item.durationDays) : 1,
      instructions: String(item.instructions || '').trim(),
    })
  }

  return normalizedItems
}

const getPatientIdForActor = async (actor) => {
  const userId = actor?.id || actor?._id

  if (!userId) {
    throw forbiddenError('Patient account is not linked to a patient record')
  }

  const patient = await Patient.findOne({ userId })

  if (!patient) {
    throw forbiddenError('Patient account is not linked to a patient record')
  }

  return patient._id
}

const getPrescriptionQuery = async (actor, filters = {}) => {
  const query = {}

  if (actor?.role === ROLES.DOCTOR) {
    query.doctorId = actor.id || actor._id
  } else if (actor?.role === ROLES.PATIENT) {
    query.patientId = await getPatientIdForActor(actor)
  } else if (filters.doctorId) {
    query.doctorId = filters.doctorId
  }

  if (filters.status && PRESCRIPTION_STATUSES.includes(filters.status)) {
    query.status = filters.status
  }

  if (filters.patientId) {
    query.patientId = filters.patientId
  }

  if (filters.isUrgent === 'true') {
    query.isUrgent = true
  }

  if (filters.isUrgent === 'false') {
    query.isUrgent = false
  }

  if (filters.q) {
    query.rxId = { $regex: escapeRegex(String(filters.q).trim()), $options: 'i' }
  }

  return query
}

const populatePrescriptionQuery = (query) =>
  query
    .populate('patientId', 'patientId name dob gender allergies medicalHistory')
    .populate('doctorId', 'firstName lastName email role')
    .populate('items.medicineId', 'name genericName brand atcCode strength dosageForm')

export const listPrescriptions = async (actor, filters = {}) => {
  const query = await getPrescriptionQuery(actor, filters)
  const { page, limit, skip } = getPagination(filters)

  const [prescriptions, total] = await Promise.all([
    populatePrescriptionQuery(Prescription.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    Prescription.countDocuments(query),
  ])

  return {
    prescriptions,
    pagination: buildPagination({ page, limit, total }),
  }
}

export const getPrescriptionById = async (id, actor) => {
  ensureObjectId(id, 'prescription id')

  const query = { _id: id }

  if (actor?.role === ROLES.DOCTOR) {
    query.doctorId = actor.id || actor._id
  } else if (actor?.role === ROLES.PATIENT) {
    query.patientId = await getPatientIdForActor(actor)
  }

  const prescription = await populatePrescriptionQuery(Prescription.findOne(query))

  if (!prescription) {
    throw prescriptionNotFound()
  }

  return prescription
}

export const createPrescription = async (payload) => {
  ensureObjectId(payload.patientId, 'patientId')
  ensureObjectId(payload.doctorId, 'doctorId')

  const [patient, doctor] = await Promise.all([
    Patient.findById(payload.patientId),
    User.findById(payload.doctorId),
  ])

  if (!patient) {
    throw validationError('Patient not found')
  }

  if (!doctor || !doctor.isActive || doctor.role !== ROLES.DOCTOR) {
    throw validationError('Doctor not found')
  }

  const normalizedItems = await normalizePrescriptionItems(payload.items)

  const prescription = await Prescription.create({
    rxId: await generateRxId(),
    patientId: patient._id,
    doctorId: doctor._id,
    diagnosis: String(payload.diagnosis || '').trim(),
    items: normalizedItems,
    status: 'Pending',
    isUrgent: Boolean(payload.isUrgent),
    allowRefills:
      Number(payload.allowRefills) >= 0 && Number(payload.allowRefills) <= 3
        ? Number(payload.allowRefills)
        : 0,
    digitalSignature: String(payload.digitalSignature || buildDigitalSignature(doctor)).trim(),
    pdfUrl: String(payload.pdfUrl || '').trim(),
  })

  if (process.env.PHARMACY_NOTIFICATION_EMAIL) {
    try {
      await sendPrescriptionNotificationEmail({
        to: process.env.PHARMACY_NOTIFICATION_EMAIL,
        rxId: prescription.rxId,
        patientName: patient.name,
        doctorName: `${doctor.firstName} ${doctor.lastName}`.trim(),
        isUrgent: prescription.isUrgent,
      })
    } catch (error) {
      console.warn(`Failed to write prescription notification email for ${prescription.rxId}: ${error.message}`)
    }
  }

  return getPrescriptionById(prescription._id, { role: ROLES.PHARMACIST })
}

export const updatePrescriptionStatus = async (id, status) => {
  ensureObjectId(id, 'prescription id')

  if (!PHARMACIST_ALLOWED_STATUSES.includes(status)) {
    throw validationError(
      `Invalid prescription status. Allowed values: ${PHARMACIST_ALLOWED_STATUSES.join(', ')}`
    )
  }

  const prescription = await Prescription.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  )

  if (!prescription) {
    throw prescriptionNotFound()
  }

  return getPrescriptionById(prescription._id, { role: ROLES.PHARMACIST })
}
