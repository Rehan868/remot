// filepath: c:\Users\admin\Downloads\V0.dev\components\ServerCompanyName.tsx
import { getCompanyName } from "@/lib/format-utils"

interface ServerCompanyNameProps {
  className?: string
}

/**
 * A server component that displays the company name
 * This uses the server-side utilities to format based on settings
 */
export async function ServerCompanyName({ className }: ServerCompanyNameProps) {
  // Get the company name from server-side settings
  const name = await getCompanyName()
  
  return <span className={className}>{name}</span>
}