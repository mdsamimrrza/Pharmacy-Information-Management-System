import dotenv from 'dotenv'
import { connectDatabase } from '../config/db.js'
import User from '../models/User.model.js'
import { hashPassword } from '../utils/password.js'

dotenv.config()

const seedUsers = [
	{
		firstName: 'Asha',
		lastName: 'Rao',
		email: 'doctor@pims.com',
		password: 'test123',
		role: 'DOCTOR',
	},
	{
		firstName: 'Naveen',
		lastName: 'Kumar',
		email: 'pharma@pims.com',
		password: 'test123',
		role: 'PHARMACIST',
	},
	{
		firstName: 'Sara',
		lastName: 'Joseph',
		email: 'admin@pims.com',
		password: 'test123',
		role: 'ADMIN',
	},
]

const seed = async () => {
	await connectDatabase()

	for (const user of seedUsers) {
		await User.updateOne(
			{ email: user.email },
			{
				$set: {
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					passwordHash: hashPassword(user.password),
					role: user.role,
					isActive: true,
				},
			},
			{ upsert: true }
		)
	}

	console.log(`Seeded ${seedUsers.length} backend auth users.`)
	process.exit(0)
}

seed().catch((error) => {
	console.error('Failed to seed users', error)
	process.exit(1)
})

