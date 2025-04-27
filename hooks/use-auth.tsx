"use client"

import type React from "react"
import type { User } from "@/types/user"

import { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { loginWithEmailPassword, logoutDirect, getCurrentUserDirect } from "@/lib/direct-auth"
import { getAuthCookie, updateLastLogin } from "@/lib/cookie-utils"

type AuthContextType = {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (
    email: string,
    password: string,
    userType?: string,
    rememberMe?: boolean,
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAuthenticated: boolean
  resetAuthState: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const checkSessionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isLoggingOut = useRef(false)
  const lastNavigationRef = useRef<string | null>(null)
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Track navigation to detect and fix stuck states
  useEffect(() => {
    // Reset navigation lock when pathname changes
    if (lastNavigationRef.current && lastNavigationRef.current !== pathname) {
      isLoggingOut.current = false;
      lastNavigationRef.current = pathname;
    }
    
    // Safety timeout to reset locks if navigation gets stuck
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    
    navigationTimeoutRef.current = setTimeout(() => {
      isLoggingOut.current = false;
    }, 2000);
    
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [pathname]);

  // Check for user session on initial load
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check for existing cookie first
        const authCookie = getAuthCookie()

        if (authCookie) {
          console.log("Found existing auth cookie, updating last login time")
          updateLastLogin()
        }

        // Get current user (will use cookie if available)
        const { user: currentUser, error: userError } = getCurrentUserDirect()

        if (userError) {
          console.error("Session check error:", userError)
        }

        setUser(currentUser)
      } catch (e) {
        console.error("Session check error:", e)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Set up periodic session checks (every 5 minutes)
    checkSessionTimeoutRef.current = setInterval(
      () => {
        const authCookie = getAuthCookie()
        if (authCookie) {
          updateLastLogin()
        }
      },
      5 * 60 * 1000,
    )

    return () => {
      if (checkSessionTimeoutRef.current) {
        clearInterval(checkSessionTimeoutRef.current)
        checkSessionTimeoutRef.current = null;
      }
    }
  }, [])

  // Function to manually reset auth state if needed
  const resetAuthState = useCallback(() => {
    isLoggingOut.current = false;
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = null;
    }
  }, []);

  const login = useCallback(async (email: string, password: string, userType?: string, rememberMe = false) => {
    // Prevent concurrent login attempts
    if (isLoggingOut.current) {
      return { success: false, error: "A navigation is already in progress" };
    }
    
    setIsLoading(true)
    setError(null)

    try {
      console.log(`Attempting to login with email: ${email}, rememberMe: ${rememberMe}`)
      const result = await loginWithEmailPassword(email, password, rememberMe)
      console.log("Login result:", result)

      if (!result.success || !result.user) {
        const errorMsg = result.error || "Invalid credentials"
        setError(errorMsg)
        setIsLoading(false)
        return { success: false, error: errorMsg }
      }

      // Check if user type matches (if specified)
      if (userType) {
        const isOwner = result.user.role?.toLowerCase() === "owner"
        const isStaff = ["administrator", "manager", "front desk", "cleaning staff"].includes(
          result.user.role?.toLowerCase() || "",
        )

        if (userType === "owner" && !isOwner) {
          // Log out since the user type doesn't match
          await logoutDirect()
          const errorMsg = "This account is not registered as an owner. Please use the staff login page."
          setError(errorMsg)
          setIsLoading(false)
          return { success: false, error: errorMsg }
        }

        if (userType === "staff" && !isStaff) {
          // Log out since the user type doesn't match
          await logoutDirect()
          const errorMsg = "This account is not registered as staff. Please use the owner login page."
          setError(errorMsg)
          setIsLoading(false)
          return { success: false, error: errorMsg }
        }
      }

      // Set the user in state
      setUser(result.user)
      setIsLoading(false)
      
      // Handle redirect if there's a stored path
      if (typeof window !== "undefined") {
        const redirectPath = sessionStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          // Set navigation lock
          isLoggingOut.current = true;
          lastNavigationRef.current = redirectPath;
          
          // Clear stored redirect
          sessionStorage.removeItem("redirectAfterLogin");
          
          // Navigate after a small delay
          setTimeout(() => {
            router.push(redirectPath);
            
            // Clear navigation lock after a timeout
            setTimeout(() => {
              isLoggingOut.current = false;
            }, 1000);
          }, 100);
        }
      }
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      console.error("Login error:", errorMessage)
      setError(errorMessage)
      setIsLoading(false)
      return { success: false, error: errorMessage }
    }
  }, [router]);

  const logout = useCallback(async () => {
    // Prevent multiple logout attempts
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;
    lastNavigationRef.current = "/login";
    
    setIsLoading(true)

    try {
      await logoutDirect()
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
      
      // Use double setTimeout to avoid router conflicts
      // First timeout to let state settle
      setTimeout(() => {
        // Actually navigate
        router.push("/login")
        
        // Second timeout to clear navigation lock after navigation
        setTimeout(() => {
          isLoggingOut.current = false;
        }, 1000);
      }, 50);
    }
  }, [router]);

  const contextValue = useMemo(() => ({
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    resetAuthState
  }), [user, isLoading, error, login, logout, resetAuthState]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
