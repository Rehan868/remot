"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ProtectedRoute } from "@/components/protected-route"
import { useMobileNavFix } from "@/hooks/use-mobile"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { registerNavigation } = useMobileNavFix()
  const navAttemptRef = useRef(0)

  // Monitor for navigation interactions and reset them if needed
  useEffect(() => {
    // Create a mutation observer to detect DOM changes that might
    // indicate stuck navigation states
    const observer = new MutationObserver(() => {
      // Increment navigation attempt counter
      navAttemptRef.current++
      
      // If we detect many DOM changes in a short period, reset navigation
      if (navAttemptRef.current > 20) {
        navAttemptRef.current = 0
        // Reset any potential stuck navigation state
        const event = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        })
        document.body.dispatchEvent(event)
      }
    })
    
    // Observe main content area for changes
    const mainContent = document.querySelector('main')
    if (mainContent) {
      observer.observe(mainContent, { 
        childList: true,
        subtree: true,
        attributes: true
      })
    }
    
    // Reset attempt counter periodically
    const resetInterval = setInterval(() => {
      navAttemptRef.current = 0
    }, 5000)
    
    // Clean up
    return () => {
      observer.disconnect()
      clearInterval(resetInterval)
    }
  }, [])

  // Register click handler on the dashboard container to track clicks
  const handleContainerClick = () => {
    registerNavigation()
  }

  return (
    <ProtectedRoute userType="staff">
      <div className="flex h-screen" onClick={handleContainerClick}>
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
