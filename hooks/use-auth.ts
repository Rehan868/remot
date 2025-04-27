"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext, useCallback } from "react"
import { getSupabaseClient, resetSupabaseClient } from "@/lib/supabase-client"
import { authService } from "@/lib/auth-service"
import { logInfo, logError } from "@/lib/debug-utils"
import { useToast } from "@/hooks/use-toast"

type User = {
  id: string
  name: string
  email: string
  role: "staff" | "owner"
} | null

type AuthContextType = {
  user: User
  login: (email: string, password: string, userType: "staff" | "owner") => Promise<void>
  ownerLogin: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState<Error | null>(null)
  const { toast } = useToast()

  // Function to refresh user data
  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true)
      logInfo("Auth Provider", "Refreshing user data")

      // Reset the Supabase client to ensure we get a fresh connection
      resetSupabaseClient()

      // Check for existing session
      const userProfile = await authService.getUserProfile()

      if (userProfile) {
        setUser({
          id: userProfile.id,
          name: userProfile.full_name,
          email: userProfile.email,
          role: userProfile.user_type as "staff" | "owner",
        })
        setIsAuthenticated(true)
        logInfo("Auth Provider", "User data refreshed successfully")
      } else {
        setUser(null)
        setIsAuthenticated(false)
        logInfo("Auth Provider", "No user session found during refresh")
      }
    } catch (error) {
      logError("Auth Provider", "Error refreshing user data:", error)
      // Don't change authentication state on refresh error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Check for existing session on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true)
        logInfo("Auth Provider", "Starting authentication check")

        // Check for app user session in localStorage
        if (typeof window !== "undefined") {
          const appUserSession = localStorage.getItem("appUserSession")
          if (appUserSession) {
            try {
              logInfo("Auth Provider", "Found app user session in localStorage")
              const parsedSession = JSON.parse(appUserSession)
              setUser({
                id: parsedSession.user.id,
                name: parsedSession.profile.full_name,
                email: parsedSession.user.email,
                role: parsedSession.profile.user_type,
              })
              setIsAuthenticated(true)
              setIsLoading(false)

              // Also set a cookie for the middleware
              document.cookie = `userType=${parsedSession.profile.user_type}; path=/; max-age=86400`

              logInfo("Auth Provider", "Restored app user session from localStorage")
              return
            } catch (e) {
              logError("Auth Provider", "Failed to parse stored app user session", e)
              localStorage.removeItem("appUserSession")
            }
          } else {
            logInfo("Auth Provider", "No app user session found in localStorage")
          }
        }

        // Check for test user session in localStorage
        if (typeof window !== "undefined") {
          const storedSession = localStorage.getItem("testUserSession")
          if (storedSession) {
            try {
              const parsedSession = JSON.parse(storedSession)
              setUser({
                id: parsedSession.user.id,
                name: parsedSession.profile.full_name,
                email: parsedSession.user.email,
                role: parsedSession.profile.user_type,
              })
              setIsAuthenticated(true)
              setIsLoading(false)

              // Also set a cookie for the middleware
              document.cookie = `userType=${parsedSession.profile.user_type}; path=/; max-age=86400`

              logInfo("Auth Provider", "Restored test user session from localStorage")
              return
            } catch (e) {
              logError("Auth Provider", "Failed to parse stored test user session", e)
              localStorage.removeItem("testUserSession")
            }
          }
        }

        try {
          const supabase = getSupabaseClient()

          // Get current auth state
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession()

          if (sessionError) {
            if (!sessionError.message.includes("session")) {
              logError("Auth Provider", "Session error:", sessionError)
            }

            // Check if it's a network error
            if (sessionError.message.includes("Failed to fetch") || sessionError.message.includes("Network error")) {
              logInfo("Auth Provider", "Network error when checking session, using fallback")

              // Try to use localStorage as fallback
              if (typeof window !== "undefined") {
                const userType = localStorage.getItem("userType")
                if (userType) {
                  // We have some user info, consider authenticated in offline mode
                  setIsAuthenticated(true)
                  setUser({
                    id: "offline-user",
                    name: "Offline User",
                    email: "offline@example.com",
                    role: userType as "staff" | "owner",
                  })

                  logInfo("Auth Provider", "Using offline mode with stored user type")
                  setIsLoading(false)
                  return
                }
              }
            }

            setIsAuthenticated(false)
            setIsLoading(false)
            return
          }

          if (session?.user) {
            logInfo("Auth Provider", "Found existing session", session.user.email)
            setIsAuthenticated(true)

            try {
              // Get user profile
              const userProfile = await authService.getUserProfile()

              if (userProfile) {
                setUser({
                  id: session.user.id,
                  name: userProfile.full_name || "User",
                  email: session.user.email!,
                  role: userProfile.user_type as "staff" | "owner",
                })

                // Set a cookie for the middleware
                document.cookie = `userType=${userProfile.user_type}; path=/; max-age=86400`

                // Store in localStorage for offline access
                if (typeof window !== "undefined") {
                  localStorage.setItem(
                    "appUserSession",
                    JSON.stringify({
                      user: session.user,
                      profile: userProfile,
                    }),
                  )
                  localStorage.setItem("userType", userProfile.user_type)
                }

                logInfo("Auth Provider", "User profile loaded", userProfile)
              } else {
                // No profile found, but we have a session
                // Create a minimal user object from session data
                setUser({
                  id: session.user.id,
                  name: session.user.user_metadata?.full_name || "User",
                  email: session.user.email!,
                  role: "staff", // Default role
                })

                logInfo("Auth Provider", "Created minimal user profile from session")
              }
            } catch (profileError) {
              logError("Auth Provider", "Error fetching user profile:", profileError)

              // Still consider authenticated but with limited user info
              setUser({
                id: session.user.id,
                name: session.user.user_metadata?.full_name || "User",
                email: session.user.email!,
                role: "staff", // Default role
              })

              logInfo("Auth Provider", "Using minimal profile due to error")
            }
          } else {
            logInfo("Auth Provider", "No active session found")
            setIsAuthenticated(false)
          }
        } catch (supabaseError) {
          logError("Auth Provider", "Supabase client error:", supabaseError)

          // Check if it's a network error
          if (
            supabaseError instanceof Error &&
            (supabaseError.message.includes("Failed to fetch") || supabaseError.message.includes("Network error"))
          ) {
            // Try to use localStorage as fallback
            if (typeof window !== "undefined") {
              const userType = localStorage.getItem("userType")
              if (userType) {
                // We have some user info, consider authenticated in offline mode
                setIsAuthenticated(true)
                setUser({
                  id: "offline-user",
                  name: "Offline User",
                  email: "offline@example.com",
                  role: userType as "staff" | "owner",
                })

                logInfo("Auth Provider", "Using offline mode with stored user type")
                setIsLoading(false)
                return
              }
            }
          }

          setIsAuthenticated(false)
        }
      } catch (error) {
        logError("Auth Provider", "General error in checkUser:", error)
        setAuthError(error instanceof Error ? error : new Error("Unknown error during authentication"))
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    // Set up auth state change listener
    const supabase = getSupabaseClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logInfo("Auth Provider", "Auth state changed:", event, session?.user?.email)

      if (event === "SIGNED_IN" && session?.user) {
        setIsAuthenticated(true)

        try {
          // Get user profile
          const userProfile = await authService.getUserProfile()

          if (userProfile) {
            setUser({
              id: session.user.id,
              name: userProfile.full_name || "User",
              email: session.user.email!,
              role: userProfile.user_type as "staff" | "owner",
            })

            // Set a cookie for the middleware
            document.cookie = `userType=${userProfile.user_type}; path=/; max-age=86400`

            // Store in localStorage for offline access
            if (typeof window !== "undefined") {
              localStorage.setItem(
                "appUserSession",
                JSON.stringify({
                  user: session.user,
                  profile: userProfile,
                }),
              )
              localStorage.setItem("userType", userProfile.user_type)
            }

            logInfo("Auth Provider", "User profile updated on auth change", userProfile)
          } else {
            // Create minimal user from session
            setUser({
              id: session.user.id,
              name: session.user.user_metadata?.full_name || "User",
              email: session.user.email!,
              role: "staff", // Default role
            })

            logInfo("Auth Provider", "Created minimal user on auth change")
          }
        } catch (profileError) {
          logError("Auth Provider", "Error fetching profile on auth change:", profileError)

          // Still consider authenticated with minimal info
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || "User",
            email: session.user.email!,
            role: "staff", // Default role
          })
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setIsAuthenticated(false)

        // Clear cookies and localStorage
        if (typeof window !== "undefined") {
          document.cookie = "testUserSession=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT"
          document.cookie = "appUserSession=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT"
          document.cookie = "userType=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT"
          document.cookie = "supabase-auth-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT"

          localStorage.removeItem("testUserSession")
          localStorage.removeItem("appUserSession")
          localStorage.removeItem("userType")
        }

        logInfo("Auth Provider", "User signed out")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string, userType: "staff" | "owner") => {
    setIsLoading(true)
    try {
      logInfo("Auth Provider", `Login attempt for ${email} as ${userType}`)
      const result = await authService.login(email, password, userType)

      // Set authentication state
      setIsAuthenticated(true)

      // Set user state
      setUser({
        id: result.user.id,
        name: result.profile.full_name,
        email: result.user.email!,
        role: result.profile.user_type as "staff" | "owner",
      })

      // Store in localStorage for offline access
      if (typeof window !== "undefined") {
        localStorage.setItem("appUserSession", JSON.stringify(result))
        localStorage.setItem("userType", result.profile.user_type)
      }

      logInfo("Auth Provider", "Login successful")
      return result
    } catch (error) {
      logError("Auth Provider", error)
      setIsAuthenticated(false)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const ownerLogin = async (email: string, password: string) => {
    return login(email, password, "owner")
  }

  const logout = async () => {
    logInfo("Auth Provider", "Logout initiated")
    setIsLoading(true)

    try {
      // First, clear the state
      setUser(null)
      setIsAuthenticated(false)

      // Show toast notification
      toast({
        title: "Logging out...",
        description: "Please wait while we log you out.",
      })

      // Call the auth service to clear sessions and cookies
      await authService.logout()

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("testUserSession")
        localStorage.removeItem("appUserSession")
        localStorage.removeItem("userSession")
        localStorage.removeItem("userType")
      }

      // Clear cookies
      if (typeof window !== "undefined") {
        document.cookie = "testUserSession=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        document.cookie = "appUserSession=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        document.cookie = "userType=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        document.cookie = "supabase-auth-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      }

      // Show success toast
      toast({
        title: "Logged out successfully",
        description: "You have been logged out successfully.",
      })

      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = "/login"
      }, 500)

      logInfo("Auth Provider", "Logout completed successfully")
    } catch (error) {
      logError("Auth Provider", "Logout error:", error)

      // Show error toast
      toast({
        title: "Logout failed",
        description: "There was an error logging you out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const contextValue = {
    user,
    login,
    ownerLogin,
    logout,
    isLoading, 
    isAuthenticated,
    refreshUser
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
