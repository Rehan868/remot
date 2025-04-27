"use client"

import { useSettings } from "@/contexts/settings-context"
import { useMemo } from "react"

export function useFormat() {
  const { getSettingValue, settings } = useSettings()

  // Create memoized formatters based on current settings
  // This ensures they re-render when settings change
  return useMemo(() => {
    // Format date based on system settings
    const formatDate = (date: Date | string | number): string => {
      if (!date) return ""
  
      const dateObj = typeof date === "object" ? date : new Date(date)
      const dateFormat = getSettingValue<string>("date_format", "MM/DD/YYYY")
  
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
  
    // Format time based on system settings
    const formatTime = (time: Date | string | number): string => {
      if (!time) return ""
  
      const timeObj = typeof time === "object" ? time : new Date(time)
  
      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(timeObj)
    }
  
    // Format date and time together
    const formatDateTime = (datetime: Date | string | number): string => {
      if (!datetime) return ""
      return `${formatDate(datetime)} ${formatTime(datetime)}`
    }
  
    // Format currency based on system settings
    const formatCurrency = (amount: number): string => {
      if (amount === undefined || amount === null) return ""
  
      const currencyCode = getSettingValue<string>("currency_format", "AED")
  
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
  
    // Format number based on system settings
    const formatNumber = (number: number, decimals = 2): string => {
      if (number === undefined || number === null) return ""
  
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(number)
    }
  
    // Get company name
    const getCompanyName = (): string => {
      return getSettingValue<string>("company_name", "Hotel Manager")
    }
  
    // Get default check-in time
    const getDefaultCheckInTime = (): string => {
      return getSettingValue<string>("default_check_in_time", "14:00")
    }
  
    // Get default check-out time
    const getDefaultCheckOutTime = (): string => {
      return getSettingValue<string>("default_check_out_time", "11:00")
    }
  
    // Get tax rate
    const getTaxRate = (): number => {
      return getSettingValue<number>("tax_rate", 5)
    }
  
    // Get currency code only
    const getCurrencyCode = (): string => {
      return getSettingValue<string>("currency_format", "AED")
    }
  
    // Get date format
    const getDateFormat = (): string => {
      return getSettingValue<string>("date_format", "MM/DD/YYYY")
    }
  
    return {
      formatDate,
      formatTime,
      formatDateTime,
      formatCurrency,
      formatNumber,
      getCompanyName,
      getDefaultCheckInTime,
      getDefaultCheckOutTime,
      getTaxRate,
      getCurrencyCode,
      getDateFormat
    }
  }, [settings, getSettingValue]) // Re-create when settings change
}
