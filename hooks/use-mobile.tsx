"use client"

import * as React from "react"
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef, useCallback } from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

/**
 * Custom hook to prevent and fix stuck navigation states
 * Use this in layout components to ensure reliable navigation
 */
export function useMobileNavFix() {
  const router = useRouter()
  const pathname = usePathname()
  const lastPathRef = useRef(pathname)
  const navigationCountRef = useRef(0)
  const lastNavigationTimeRef = useRef(0)
  
  // Track clicks to detect potential navigation issues
  const registerNavigation = useCallback(() => {
    navigationCountRef.current += 1
    lastNavigationTimeRef.current = Date.now()
    
    // If we detect rapid navigation attempts, refresh the page to unstick
    if (navigationCountRef.current > 10 && Date.now() - lastNavigationTimeRef.current < 5000) {
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }
  }, [])
  
  // Reset navigation counter when path changes
  useEffect(() => {
    if (pathname !== lastPathRef.current) {
      lastPathRef.current = pathname
      navigationCountRef.current = 0
    }
  }, [pathname])
  
  // Add a global click handler to detect potential stuck navigation
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    let clickTimeout: NodeJS.Timeout
    
    const globalClickHandler = () => {
      // Clear any existing timeout
      if (clickTimeout) clearTimeout(clickTimeout)
      
      // Set a new timeout to reset navigation state
      clickTimeout = setTimeout(() => {
        navigationCountRef.current = 0
      }, 500)
    }
    
    window.addEventListener('click', globalClickHandler, { passive: true })
    
    // Cleanup
    return () => {
      window.removeEventListener('click', globalClickHandler)
      if (clickTimeout) clearTimeout(clickTimeout)
    }
  }, [])
  
  return { registerNavigation }
}
