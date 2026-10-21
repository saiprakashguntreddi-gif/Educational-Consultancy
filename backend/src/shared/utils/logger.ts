/**
 * Simple structured console logger for backend modules
 */
export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, error);
  },
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] [${new Date().toISOString()}] ${message}`, meta ? JSON.stringify(meta) : '');
    }
  },
};
