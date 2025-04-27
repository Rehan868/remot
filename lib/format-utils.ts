// filepath: c:\Users\admin\Downloads\V0.dev\lib\format-utils.ts
import { getAllSettings } from "@/app/actions/settings-actions"

// Cache settings for server components
let settingsCache: Record<string, any> | null = null
let lastFetchTime: number = 0
const CACHE_TTL = 60000 // 1 minute cache TTL

/**
 * Get a setting value with fallback for server components
 */
async function getSettingValue<T>(key: string, defaultValue: T): Promise<T> {
  // Check if we need to refresh the cache
  const now = Date.now()
  if (!settingsCache || now - lastFetchTime > CACHE_TTL) {
    try {
      const settings = await getAllSettings()
      
      // Convert array of settings to an object
      settingsCache = settings.reduce((acc, setting) => {
        // Parse the setting value based on its type
        let value: any = setting.value
        
        try {
          if (setting.type === 'number') {
            value = Number.parseFloat(setting.value)
          } else if (setting.type === 'boolean') {
            value = setting.value.toLowerCase() === 'true'
          } else if (setting.type === 'json') {
            value = JSON.parse(setting.value)
          }
        } catch (error) {
          console.error(`Error parsing setting ${setting.key}:`, error)
        }
        
        acc[setting.key] = value
        return acc
      }, {} as Record<string, any>)
      
      lastFetchTime = now
    } catch (error) {
      console.error("Error fetching settings:", error)
      // If fetch fails, use default value
      return defaultValue
    }
  }
  
  return settingsCache && key in settingsCache ? settingsCache[key] : defaultValue
}

/**
 * Server-side date formatter
 */
export async function formatDate(date: Date | string | number): Promise<string> {
  if (!date) return ""
  
  const dateObj = typeof date === "object" ? date : new Date(date)
  const dateFormat = await getSettingValue<string>("date_format", "MM/DD/YYYY")
  
  // Convert date format to Intl.DateTimeFormat options
  const options: Intl.DateTimeFormatOptions = {}
  
  if (dateFormat.includes("YYYY")) {
    options.year = "numeric"
  } else if (dateFormat.includes("YY")) {
    options.year = "2-digit"
  }
  
  if (dateFormat.includes("MM")) {
    options.month = "2-digit"
  } else if (dateFormat.includes("MMM")) {
    options.month = "short"
  } else if (dateFormat.includes("MMMM")) {
    options.month = "long"
  }
  
  if (dateFormat.includes("DD")) {
    options.day = "2-digit"
  } else if (dateFormat.includes("D")) {
    options.day = "numeric"
  }
  
  return new Intl.DateTimeFormat("en-US", options).format(dateObj)
}

/**
 * Server-side time formatter
 */
export async function formatTime(time: Date | string | number): Promise<string> {
  if (!time) return ""
  
  const timeObj = typeof time === "object" ? time : new Date(time)
  
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(timeObj)
}

/**
 * Server-side date and time formatter
 */
export async function formatDateTime(datetime: Date | string | number): Promise<string> {
  if (!datetime) return ""
  const date = await formatDate(datetime)
  const time = await formatTime(datetime)
  return `${date} ${time}`
}

/**
 * Server-side currency formatter
 */
export async function formatCurrency(amount: number): Promise<string> {
  if (amount === undefined || amount === null) return ""
  
  const currencyCode = await getSettingValue<string>("currency_format", "AED")
  
  // Special formatting for AED to include the Dirham symbol
  if (currencyCode === "AED") {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Server-side number formatter
 */
export async function formatNumber(number: number, decimals = 2): Promise<string> {
  if (number === undefined || number === null) return ""
  
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number)
}

/**
 * Get company name
 */
export async function getCompanyName(): Promise<string> {
  return await getSettingValue<string>("company_name", "Hotel Manager")
}

/**
 * Get default check-in time
 */
export async function getDefaultCheckInTime(): Promise<string> {
  return await getSettingValue<string>("default_check_in_time", "14:00")
}

/**
 * Get default check-out time
 */
export async function getDefaultCheckOutTime(): Promise<string> {
  return await getSettingValue<string>("default_check_out_time", "11:00")
}

/**
 * Get tax rate
 */
export async function getTaxRate(): Promise<number> {
  return await getSettingValue<number>("tax_rate", 5)
}

/**
 * Get currency code
 */
export async function getCurrencyCode(): Promise<string> {
  return await getSettingValue<string>("currency_format", "AED")
}

/**
 * Get date format
 */
export async function getDateFormat(): Promise<string> {
  return await getSettingValue<string>("date_format", "MM/DD/YYYY")
}

/**
 * Clear settings cache
 */
export function clearSettingsCache(): void {
  settingsCache = null
  lastFetchTime = 0
}

/**
 * Force refresh settings cache
 */
export async function refreshSettingsCache(): Promise<void> {
  settingsCache = null
  lastFetchTime = 0
  
  // Force a refresh of the cache
  await getSettingValue("_refresh", null)
}