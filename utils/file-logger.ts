// utils/file-logger.ts
// DO NOT import fs directly - it causes build errors

let fs: any = null
let path: any = null

// Only import Node.js modules on server side
if (typeof window === 'undefined') {
  // Server-side (Node.js)
  fs = require('fs')
  path = require('path')
}

export const logToFile = (message: string, data?: any): void => {
  const timestamp = new Date().toISOString()
  const dataString = data ? JSON.stringify(data, null, 2) : ''
  const logEntry = `[${timestamp}] ${message} ${dataString}\n`
  
  // Always log to console for immediate feedback
  console.log(`📝 ${message}`, data || '')
  
  // Server-side: write to file
  if (typeof window === 'undefined' && fs && path) {
    try {
      const LOG_DIR = path.join(process.cwd(), 'logs')
      const LOG_FILE = path.join(LOG_DIR, 'api-debug.log')
      
      if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true })
      }
      
      fs.appendFileSync(LOG_FILE, logEntry, 'utf8')
    } catch (error) {
      console.error('Failed to write to log file:', error)
    }
  } else {
    // Client-side: store in localStorage
    try {
      const existing = localStorage.getItem('api_logs') || ''
      const newLogs = existing + logEntry
      // Keep only last 5000 characters
      localStorage.setItem('api_logs', newLogs.slice(-5000))
    } catch (e) {
      // Silently fail if localStorage not available
    }
  }
}

/**
 * Read logs from localStorage (browser) or file (server)
 */
export const getLogs = (): string => {
  if (typeof window === 'undefined') {
    // Server-side: read from file
    if (fs && path) {
      try {
        const LOG_FILE = path.join(process.cwd(), 'logs', 'api-debug.log')
        if (fs.existsSync(LOG_FILE)) {
          return fs.readFileSync(LOG_FILE, 'utf8')
        }
      } catch (error) {
        console.error('Failed to read log file:', error)
      }
    }
    return 'Server logs not available'
  } else {
    // Client-side: read from localStorage
    return localStorage.getItem('api_logs') || 'No browser logs'
  }
}

/**
 * Clear logs
 */
export const clearLogs = (): void => {
  if (typeof window === 'undefined') {
    // Server-side: clear file
    if (fs && path) {
      try {
        const LOG_FILE = path.join(process.cwd(), 'logs', 'api-debug.log')
        if (fs.existsSync(LOG_FILE)) {
          fs.writeFileSync(LOG_FILE, '', 'utf8')
        }
      } catch (error) {
        console.error('Failed to clear log file:', error)
      }
    }
  } else {
    // Client-side: clear localStorage
    localStorage.removeItem('api_logs')
  }
}

/**
 * Download logs as file (browser only)
 */
export const downloadLogs = (): void => {
  if (typeof window === 'undefined') return
  
  try {
    const logs = localStorage.getItem('api_logs') || 'No logs available'
    const blob = new Blob([logs], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `api-logs-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to download logs:', error)
  }
}