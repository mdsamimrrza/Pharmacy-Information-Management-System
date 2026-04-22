import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { connectDatabase } from '../config/db.js'
import Medicine from '../models/Medicine.model.js'
import medicineSeedDocs from '../data/medicine.seed.js'

const currentFilePath = fileURLToPath(import.meta.url)
const currentDir = dirname(currentFilePath)
const backendRoot = resolve(currentDir, '../..')

dotenv.config({ path: resolve(backendRoot, '.env') })

const normalizeString = (value) => String(value || '').trim()
const normalizeAtcCode = (value) => String(value || '').trim().toUpperCase()

const buildFilter = (doc) => ({
  name: normalizeString(doc.name),
  genericName: normalizeString(doc.genericName),
  brand: normalizeString(doc.brand),
  atcCode: normalizeAtcCode(doc.atcCode),
  strength: normalizeString(doc.strength),
  dosageForm: doc.dosageForm || 'Tablet',
})

const run = async () => {
  await connectDatabase()

  const operations = medicineSeedDocs.map((doc) => ({
    updateOne: {
      filter: buildFilter(doc),
      update: {
        $set: {
          ...doc,
          atcCode: normalizeAtcCode(doc.atcCode),
        },
      },
      upsert: true,
    },
  }))

  const result = await Medicine.bulkWrite(operations, { ordered: false })

  console.log(`Seeded ${medicineSeedDocs.length} medicines from embedded seed data`)
  console.log(
    `Inserted: ${result.upsertedCount || 0}, Updated: ${result.modifiedCount || 0}, Matched: ${result.matchedCount || 0}`
  )
  process.exit(0)
}

run().catch((error) => {
  console.error(`Failed to seed medicines: ${error.message}`)
  process.exit(1)
})
