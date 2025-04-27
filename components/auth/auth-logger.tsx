"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"

export function AuthLogger() {
  const { user } = useAuth()
  const hasLoggedLogin = useRef(false)

  useEffect(() => {
    if (!user) return

    // Create a function to log auth events
    const logAuthEvent = async (action: "login" | "logout") => {
      try {
        await fetch("/api/audit-log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            action,
            entityType: "auth",
            details: `User ${action === "login" ? "signed in" : "signed out"}`,
          }),
        })
      } catch (error) {
        console.error(`Error logging ${action} event:`, error)
      }
    }

    // Only log login once to prevent infinite loops
    if (!hasLoggedLogin.current) {
      logAuthEvent("login")
      hasLoggedLogin.current = true
    }

    // We'll handle logout differently to avoid the cleanup function causing issues
    const handleBeforeUnload = () => {
      logAuthEvent("logout")
    }

    // Add event listener for page unload instead of using cleanup function
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [user])

  return null
}
