// Test authentication credentials
require('dotenv').config({ path: '.env.local' })

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@dinmay.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tapuhero@123'

console.log('Environment Variables Test:')
console.log('============================')
console.log('NEXT_PUBLIC_ADMIN_EMAIL:', ADMIN_EMAIL)
console.log('ADMIN_PASSWORD:', ADMIN_PASSWORD)
console.log('============================')

// Test credentials
const testEmail = 'dinmaybrahmaofficial@gmail.com'
const testPassword = 'Tapuhero@123'

console.log('\nCredential Test:')
console.log('Email match:', testEmail === ADMIN_EMAIL)
console.log('Password match:', testPassword === ADMIN_PASSWORD)

if (testEmail === ADMIN_EMAIL && testPassword === ADMIN_PASSWORD) {
  console.log('\n✅ Credentials are CORRECT!')
} else {
  console.log('\n❌ Credentials do NOT match!')
  console.log('Expected email:', ADMIN_EMAIL)
  console.log('Provided email:', testEmail)
  console.log('Expected password:', ADMIN_PASSWORD)
  console.log('Provided password:', testPassword)
}
