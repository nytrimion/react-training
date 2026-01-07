describe('Setup verification', () => {
  it('should run tests correctly', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have TypeScript working', () => {
    const greeting: string = 'Hello, React!'
    expect(greeting).toContain('React')
  })
})
