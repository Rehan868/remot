// filepath: c:\Users\admin\Downloads\V0.dev\components\ui\currency-display.tsx
"use client"

import { useFormat } from "@/hooks/use-format"

interface CurrencyDisplayProps {
  amount: number
  className?: string
}

/**
 * A component that displays currency values using the system's currency format settings
 * It will automatically update when the currency format is changed in settings
 */
export function CurrencyDisplay({ amount, className }: CurrencyDisplayProps) {
  const { formatCurrency } = useFormat()
  
  return <span className={className}>{formatCurrency(amount)}</span>
}