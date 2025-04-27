// Debug utilities for logging

export function logInfo(component: string, message: string, ...data: any[]) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[${component}]`, message, ...data)
  }
}

export function logError(component: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    if (error instanceof Error) {
      console.error(`[${component}]`, error.message, error)
    } else {
      console.error(`[${component}]`, "Unknown error:", error)
    }
  }
}
