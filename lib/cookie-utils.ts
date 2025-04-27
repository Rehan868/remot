import Cookies from "js-cookie"
import { v4 as uuidv4 } from "uuid"

// Cookie names
export const AUTH_COOKIE_NAME = "bookopia_auth"
export const DEVICE_ID_COOKIE_NAME = "bookopia_device_id"

// Cookie expiration (in days)
const REMEMBER_ME_EXPIRATION = 30
const DEFAULT_EXPIRATION = 1

export interface AuthCookieData {
  userId: string
  email: string
  role: string
  token: string
  deviceId: string
  ipAddress?: string
  lastLogin: string
}

// Set authentication cookie
export function setAuthCookie(data: Omit<AuthCookieData, "lastLogin">, rememberMe = false) {
  const cookieData: AuthCookieData = {
    ...data,
    lastLogin: new Date().toISOString(),
  }

  Cookies.set(AUTH_COOKIE_NAME, JSON.stringify(cookieData), {
    expires: rememberMe ? REMEMBER_ME_EXPIRATION : DEFAULT_EXPIRATION,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })
}

// Get authentication cookie
export function getAuthCookie(): AuthCookieData | null {
  const cookie = Cookies.get(AUTH_COOKIE_NAME)
  if (!cookie) return null

  try {
    return JSON.parse(cookie) as AuthCookieData
  } catch (error) {
    console.error("Failed to parse auth cookie:", error)
    return null
  }
}

// Remove authentication cookie
export function removeAuthCookie() {
  Cookies.remove(AUTH_COOKIE_NAME)
}

// Get or create device ID
export function getOrCreateDeviceId(): string {
  let deviceId = Cookies.get(DEVICE_ID_COOKIE_NAME)

  if (!deviceId) {
    deviceId = uuidv4()
    Cookies.set(DEVICE_ID_COOKIE_NAME, deviceId, {
      expires: 365, // 1 year
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
  }

  return deviceId
}

// Get user's IP address (client-side)
export async function getClientIpAddress(): Promise<string> {
  try {
    const response = await fetch("https://api.ipify.org?format=json")
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.error("Failed to get IP address:", error)
    return "unknown"
  }
}

// Update last login time in the cookie
export function updateLastLogin() {
  const authCookie = getAuthCookie()
  if (authCookie) {
    setAuthCookie(
      {
        ...authCookie,
        lastLogin: new Date().toISOString(),
      },
      true,
    )
  }
}
