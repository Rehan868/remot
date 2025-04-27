// filepath: c:\Users\admin\Downloads\V0.dev\components\CompanyName.tsx
"use client"

import { useFormat } from "@/hooks/use-format"

interface CompanyNameProps {
  className?: string
}

/**
 * A component that displays the company name
 * It will automatically update when the company name is changed in settings
 */
export function CompanyName({ className }: CompanyNameProps) {
  const { getCompanyName } = useFormat()
  
  return <span className={className}>{getCompanyName()}</span>
}