import '@testing-library/jest-dom'

// Global test setup
global.console = {
  ...console,
  // Suppress console.log in tests unless needed
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}