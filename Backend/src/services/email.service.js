import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, relative } from 'node:path'
import {
  buildInviteEmail,
  buildPasswordChangedEmail,
  buildPasswordResetEmail,
  buildPrescriptionNotificationEmail,
} from '../utils/emailTemplates.js'

const currentFilePath = fileURLToPath(import.meta.url)
const currentDir = dirname(currentFilePath)
const backendRoot = resolve(currentDir, '../..')

const getEmailMode = () => String(process.env.EMAIL_MODE || 'file').trim().toLowerCase()

const getOutboxDir = () => resolve(backendRoot, process.env.EMAIL_OUTBOX_DIR || 'outbox')

const sanitizeFilename = (value) =>
  String(value || 'email')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'email'

const writeEmailToOutbox = async (payload) => {
  const outboxDir = getOutboxDir()
  await fs.mkdir(outboxDir, { recursive: true })

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `${timestamp}-${sanitizeFilename(payload.type)}-${sanitizeFilename(payload.to)}.json`
  const filepath = resolve(outboxDir, filename)

  await fs.writeFile(
    filepath,
    JSON.stringify(
      {
        ...payload,
        createdAt: new Date().toISOString(),
      },
      null,
      2
    ),
    'utf8'
  )

  return {
    delivered: true,
    mode: 'file',
    outboxFile: relative(backendRoot, filepath),
  }
}

export const sendEmail = async ({ to, subject, html, text, type = 'generic', metadata = {} }) => {
  const mode = getEmailMode()

  if (mode === 'disabled') {
    return {
      delivered: false,
      mode,
      skipped: true,
    }
  }

  return writeEmailToOutbox({
    to,
    subject,
    html,
    text,
    type,
    metadata,
  })
}

export const sendInviteEmail = async ({ firstName, lastName, email, role, password }) => {
  const emailPayload = buildInviteEmail({ firstName, lastName, email, role, password })

  return sendEmail({
    to: email,
    subject: emailPayload.subject,
    html: emailPayload.html,
    text: emailPayload.text,
    type: 'invite',
    metadata: { role },
  })
}

export const sendPasswordResetEmail = async ({ firstName, lastName, email, resetToken, resetUrl }) => {
  const emailPayload = buildPasswordResetEmail({ firstName, lastName, email, resetToken, resetUrl })

  return sendEmail({
    to: email,
    subject: emailPayload.subject,
    html: emailPayload.html,
    text: emailPayload.text,
    type: 'password-reset',
    metadata: { resetToken },
  })
}

export const sendPasswordChangedEmail = async ({ firstName, lastName, email }) => {
  const emailPayload = buildPasswordChangedEmail({ firstName, lastName, email })

  return sendEmail({
    to: email,
    subject: emailPayload.subject,
    html: emailPayload.html,
    text: emailPayload.text,
    type: 'password-changed',
    metadata: {},
  })
}

export const sendPrescriptionNotificationEmail = async ({
  to,
  rxId,
  patientName,
  doctorName,
  isUrgent,
}) => {
  const emailPayload = buildPrescriptionNotificationEmail({
    rxId,
    patientName,
    doctorName,
    isUrgent,
  })

  return sendEmail({
    to,
    subject: emailPayload.subject,
    html: emailPayload.html,
    text: emailPayload.text,
    type: 'prescription-notification',
    metadata: { rxId, isUrgent },
  })
}
