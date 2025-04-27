"use client"

import type React from "react"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Spinner } from "@/components/ui/spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  userType?: "staff" | "owner" | "any"
}

export function ProtectedRoute({ children, userType = "any" }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  
  // Track navigation state to prevent concurrent navigation attempts
  const isNavigatingRef = useRef(false)
  const lastPathRef = useRef(pathname)

  // Use useCallback for the auth checking function
  const checkAuth = useCallback(async () => {
    // Skip if still loading auth state or already navigating
    if (isLoading || isNavigatingRef.current) return

    setIsCheckingAuth(true)

    if (!isAuthenticated) {
      // Store the current path to redirect back after login
      if (typeof window !== "undefined" && window.sessionStorage) {
        try {
          sessionStorage.setItem("redirectAfterLogin", window.location.pathname)
        } catch (e) {
          console.error("Failed to set session storage", e)
        }
      }

      // Set navigating state to prevent multiple redirects
      isNavigatingRef.current = true
      
      // Clear navigation state after timeout in case navigation fails
      setTimeout(() => {
        isNavigatingRef.current = false
      }, 1000)
      
      // Redirect to appropriate login page without blocking the UI thread
      if (userType === "owner") {
        router.push("/login/owner")
      } else {
        router.push("/login")
      }
      return
    }

    // Check user type if specified
    if (userType !== "any" && user) {
      const isOwner = user.role?.toLowerCase() === "owner"
      const isStaff = ["administrator", "manager", "front desk", "cleaning staff"].includes(
        user.role?.toLowerCase() || ""
      )

      // Set navigating state to prevent multiple redirects
      if (
        (userType === "owner" && !isOwner) || 
        (userType === "staff" && !isStaff)
      ) {
        isNavigatingRef.current = true
        
        // Clear navigation state after timeout in case navigation fails
        setTimeout(() => {
          isNavigatingRef.current = false
        }, 1000)

        if (userType === "owner" && !isOwner) {
          router.push("/login/owner")
          return
        }
  
        if (userType === "staff" && !isStaff) {
          router.push("/login")
          return
        }
      }
    }

    // User is authenticated and authorized
    setIsAuthorized(true)
    setIsCheckingAuth(false)
  }, [isLoading, isAuthenticated, user, userType, router])

  // Monitor pathname changes to detect if we've navigated
  // This helps reset navigation state when routing completes
  useEffect(() => {
    if (pathname !== lastPathRef.current) {
      lastPathRef.current = pathname
      isNavigatingRef.current = false
    }
  }, [pathname])

  // Reset navigation state after component mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      isNavigatingRef.current = false
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Show loading spinner while checking auth
  if (isLoading || isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  // Render children only if authorized
  return isAuthorized ? <>{children}</> : null
}
