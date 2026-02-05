// utils/file-logger.ts
import fs from 'fs'
import path from 'path'

// Define log file path
const LOG_DIR = path.join(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'api-debug.log')

// Ensure log directory exists
if (typeof window === 'undefined') {
  // Node.js environment
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  }
}

/**
 * Log message to file (server-side only)
 */
export const logToFile = (message: string, data?: any): void => {
  // Only log on server side
  if (typeof window !== 'undefined') {
    return // Skip in browser
  }

  try {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message} ${data ? JSON.stringify(data, null, 2) : ''}\n`
    
    fs.appendFileSync(LOG_FILE, logEntry, 'utf8')
    
    // Also show in console (optional)
    console.log(message, data || '')
  } catch (error) {
    console.error('Failed to write to log file:', error)
  }
}

/**
 * Read log file content
 */
export const readLogFile = (): string => {
  try {
    if (fs.existsSync(LOG_FILE)) {
      return fs.readFileSync(LOG_FILE, 'utf8')
    }
    return 'No log file found'
  } catch (error) {
    return `Error reading log: ${error}`
  }
}

/**
 * Clear log file
 */
export const clearLogFile = (): void => {
  try {
    if (fs.existsSync(LOG_FILE)) {
      fs.writeFileSync(LOG_FILE, '', 'utf8')
    }
  } catch (error) {
    console.error('Failed to clear log file:', error)
  }
} 