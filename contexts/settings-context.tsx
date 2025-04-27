"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase-client"
import { type SystemSetting, getAllSettings, updateSetting } from "@/app/actions/settings-actions"
import { useToast } from "@/hooks/use-toast"

// Define the shape of our settings context
interface SettingsContextType {
  settings: Record<string, any>
  isLoading: boolean
  error: string | null
  updateSetting: (key: string, value: string) => Promise<void>
  getSettingValue: <T>(key: string, defaultValue: T) => T
  refreshSettings: () => Promise<void>
}

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const defaultSettings = {
  company_name: "Hotel Manager",
  company_email: "info@hotelmanager.com",
  date_format: "MM/DD/YYYY",
  currency_format: "AED",
  email_notifications: true,
  auto_checkout: true,
  default_check_in_time: "14:00",
  default_check_out_time: "11:00",
  tax_rate: 5,
  reminder_days: 2,
  booking_confirmation: true,
  check_in_reminder: true,
  check_out_reminder: true,
  post_stay_thank_you: true,
  cancellation_notice: true,
  staff_notifications: true,
}

// Provider component
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Record<string, any>>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()
  const hasInitialized = useRef(false)

  // Function to parse setting values based on their type
  const parseSettingValue = (setting: SystemSetting) => {
    try {
      switch (setting.type) {
        case "number":
          return Number.parseFloat(setting.value)
        case "boolean":
          return setting.value.toLowerCase() === "true"
        case "json":
          return JSON.parse(setting.value)
        case "string":
        default:
          return setting.value
      }
    } catch (error) {
      console.error(`Error parsing setting ${setting.key}:`, error)
      return setting.value
    }
  }

  // Load settings from the database only once on initial mount
  useEffect(() => {
    if (hasInitialized.current) return

    async function loadSettings() {
      try {
        setIsLoading(true)
        setError(null)

        // Add this check to handle missing Supabase connection
        const isMockClient = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (isMockClient) {
          console.warn("Using default settings - Supabase connection not available")
          setSettings(defaultSettings)
          hasInitialized.current = true
          setIsLoading(false)
          return
        }

        const settingsData = await getAllSettings()

        // Convert array of settings to an object with key-value pairs
        const settingsObject = settingsData.reduce(
          (acc, setting) => {
            acc[setting.key] = parseSettingValue(setting)
            return acc
          },
          { ...defaultSettings } as Record<string, any>,
        )

        setSettings(settingsObject)
        hasInitialized.current = true
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load settings"
        setError(errorMessage)
        console.error("Error loading settings:", errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Function to update a setting
  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      const result = await updateSetting(key, value)

      if (!result.success) {
        throw new Error(result.message)
      }

      // Update local state immediately for better UX
      setSettings((prev) => ({
        ...prev,
        [key]: value,
      }))

      toast({
        title: "Setting Updated",
        description: `${key} has been updated successfully.`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update setting"
      toast({
        title: "Error updating setting",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    }
  }

  // Function to get a setting value with a default fallback
  const getSettingValue = <T,>(key: string, defaultValue: T): T => {
    return key in settings ? settings[key] : defaultValue
  }

  // Function to refresh settings from the database
  const refreshSettings = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const settingsData = await getAllSettings()

      // Convert array of settings to an object with key-value pairs
      const settingsObject = settingsData.reduce(
        (acc, setting) => {
          acc[setting.key] = parseSettingValue(setting)
          return acc
        },
        { ...defaultSettings } as Record<string, any>,
      )

      setSettings(settingsObject)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load settings"
      setError(errorMessage)
      console.error("Error refreshing settings:", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        error,
        updateSetting: handleUpdateSetting,
        getSettingValue,
        refreshSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

// Hook to use the settings context
export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
