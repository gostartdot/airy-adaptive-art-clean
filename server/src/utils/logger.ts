export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`ℹ️  [INFO] ${message}`, ...args);
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`❌ [ERROR] ${message}`, ...args);
  },
  
  warn: (message: string, ...args: any[]) => {
    console.warn(`⚠️  [WARN] ${message}`, ...args);
  },
  
  success: (message: string, ...args: any[]) => {
    console.log(`✅ [SUCCESS] ${message}`, ...args);
  },
  
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 [DEBUG] ${message}`, ...args);
    }
  }
};

