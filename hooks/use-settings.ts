"use client"

import { useState, useEffect } from "react"

export interface GeneralSettings {
  companyName: string
  companyEmail: string
  dateFormat: string
  currencyFormat: string
  emailNotifications: boolean
  autoCheckout: boolean
  defaultCheckInTime: string
  defaultCheckOutTime: string
  taxRate: string
  reminderDays: string
}

export interface NotificationSettings {
  bookingConfirmation: boolean
  checkInReminder: boolean
  checkOutReminder: boolean
  postStayThankYou: boolean
  cancellationNotice: boolean
  staffNotifications: boolean
}

// Mock data for settings
const mockGeneralSettings: GeneralSettings = {
  companyName: "StayEase Hotel Management",
  companyEmail: "info@stayease.com",
  dateFormat: "MM/DD/YYYY",
  currencyFormat: "USD",
  emailNotifications: true,
  autoCheckout: true,
  defaultCheckInTime: "14:00",
  defaultCheckOutTime: "11:00",
  taxRate: "8.5",
  reminderDays: "2",
}

const mockNotificationSettings: NotificationSettings = {
  bookingConfirmation: true,
  checkInReminder: true,
  checkOutReminder: true,
  postStayThankYou: true,
  cancellationNotice: true,
  staffNotifications: true,
}

export function useSettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null)

  // Simulate fetching settings from an API
  const fetchSettings = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Set mock data
      setGeneralSettings(mockGeneralSettings)
      setNotificationSettings(mockNotificationSettings)
    } catch (err) {
      console.error("Error fetching settings:", err)
      setError("Failed to load settings. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Simulate saving general settings
  const saveGeneralSettings = async (settings: GeneralSettings): Promise<boolean> => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Update local state
      setGeneralSettings(settings)
      return true
    } catch (err) {
      console.error("Error saving general settings:", err)
      return false
    }
  }

  // Simulate saving notification settings
  const saveNotificationSettings = async (settings: NotificationSettings): Promise<boolean> => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Update local state
      setNotificationSettings(settings)
      return true
    } catch (err) {
      console.error("Error saving notification settings:", err)
      return false
    }
  }

  // Refresh settings
  const refreshSettings = () => {
    fetchSettings()
  }

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    isLoading,
    error,
    generalSettings,
    notificationSettings,
    saveGeneralSettings,
    saveNotificationSettings,
    refreshSettings,
  }
}
