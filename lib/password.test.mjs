import test from 'node:test'
import assert from 'node:assert/strict'
import { hashPassword, verifyPassword } from './password.ts'

test('hashPassword produces a safe hash and verifyPassword validates it', () => {
  const rawPassword = 'secret123'
  const hashed = hashPassword(rawPassword)

  assert.notEqual(hashed, rawPassword)
  assert.equal(verifyPassword(rawPassword, hashed), true)
  assert.equal(verifyPassword('wrong-password', hashed), false)
})
