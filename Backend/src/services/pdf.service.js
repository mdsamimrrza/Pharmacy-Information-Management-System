import Prescription from '../models/Prescription.model.js'
import { getPrescriptionById } from './prescription.service.js'

const notFoundError = () => {
  const error = new Error('Prescription not found')
  error.statusCode = 404
  return error
}

const normalizePdfText = (value) =>
  String(value ?? '')
    .replace(/[^\x20-\x7E]/g, '?')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')

const wrapText = (text, maxLength = 88) => {
  const words = String(text || '').split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return ['']
  }

  const lines = []
  let currentLine = words[0]

  for (let index = 1; index < words.length; index += 1) {
    const nextLine = `${currentLine} ${words[index]}`

    if (nextLine.length > maxLength) {
      lines.push(currentLine)
      currentLine = words[index]
    } else {
      currentLine = nextLine
    }
  }

  lines.push(currentLine)
  return lines
}

const buildPdfBuffer = (lines) => {
  const contentLines = [
    'BT',
    '/F1 11 Tf',
    '50 790 Td',
    '14 TL',
    ...lines.flatMap((line) => [`(${normalizePdfText(line)}) Tj`, 'T*']),
    'ET',
  ]

  const contentStream = contentLines.join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(contentStream, 'utf8')} >>\nstream\n${contentStream}\nendstream`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'))
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })

  const xrefOffset = Buffer.byteLength(pdf, 'utf8')
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  pdf += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('')
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return Buffer.from(pdf, 'utf8')
}

export const generatePrescriptionPdf = async (prescriptionId, actor) => {
  const prescription = await getPrescriptionById(prescriptionId, actor)

  if (!prescription) {
    throw notFoundError()
  }

  const lines = [
    'PIMS Prescription',
    `Rx ID: ${prescription.rxId}`,
    `Status: ${prescription.status}`,
    `Created: ${new Date(prescription.createdAt).toLocaleString()}`,
    prescription.isUrgent ? 'Priority: Urgent' : 'Priority: Standard',
    '',
    'Doctor',
    `Name: Dr. ${prescription.doctorId?.firstName || ''} ${prescription.doctorId?.lastName || ''}`.trim(),
    `Email: ${prescription.doctorId?.email || 'N/A'}`,
    '',
    'Patient',
    `Name: ${prescription.patientId?.name || 'N/A'}`,
    `Patient ID: ${prescription.patientId?.patientId || 'N/A'}`,
    `DOB: ${prescription.patientId?.dob ? new Date(prescription.patientId.dob).toLocaleDateString() : 'N/A'}`,
    `Gender: ${prescription.patientId?.gender || 'N/A'}`,
    '',
    `Diagnosis: ${prescription.diagnosis || 'N/A'}`,
    `Digital Signature: ${prescription.digitalSignature || 'N/A'}`,
    '',
    'Prescription Items',
  ]

  prescription.items.forEach((item, index) => {
    const medicineName =
      item.medicineId?.name ||
      item.medicineId?.genericName ||
      item.atcCode

    const itemLines = [
      `${index + 1}. ${medicineName}`,
      `ATC: ${item.atcCode} | Dose: ${item.dose} | Frequency: ${item.frequency} | Route: ${item.route}`,
      `Duration: ${item.durationDays} day(s) | Instructions: ${item.instructions || 'N/A'}`,
    ]

    itemLines.forEach((itemLine) => {
      wrapText(itemLine).forEach((wrappedLine) => lines.push(wrappedLine))
    })

    lines.push('')
  })

  return buildPdfBuffer(lines.slice(0, 60))
}
