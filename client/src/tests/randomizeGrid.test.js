import { expect, it } from 'vitest'

function randomStartColumn(columns = 40, min = 1) {
  const startColumn = Math.floor(Math.random() * (columns / 4 - min) + min)
  return startColumn
}

function randomEndColumn(columns = 40) {
  const minEnd = columns / 2
  const randomEndColumn = Math.floor(Math.random() * (columns - minEnd) + minEnd)
  return randomEndColumn
}

it('randoms start should be < 10', () => {
  for (let i = 0; i < 1000; i++) {
    const result = randomStartColumn()
    expect(result).toBeLessThanOrEqual(10)
  }
})

it('randoms end should be > 20', () => {
  for (let i = 0; i < 1000; i++) {
    const result = randomEndColumn()
    expect(result).toBeGreaterThanOrEqual(20)
  }
})
