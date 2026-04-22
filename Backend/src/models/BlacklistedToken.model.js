import mongoose from 'mongoose'

const blacklistedTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '1s' }, // Automatically remove document when it expires
    },
  },
  {
    timestamps: true,
  }
)

const BlacklistedToken = mongoose.models.BlacklistedToken || mongoose.model('BlacklistedToken', blacklistedTokenSchema)

export default BlacklistedToken
