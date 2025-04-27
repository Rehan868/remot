export type User = {
  id: string
  name: string
  email: string
  role: string
  avatar_url?: string | null
  created_at?: string
  updated_at?: string
}

export function isStaffRole(role: string): boolean {
  const staffRoles = ["administrator", "manager", "front desk", "cleaning staff"]
  return staffRoles.includes(role.toLowerCase())
}

export function isOwnerRole(role: string): boolean {
  return role.toLowerCase() === "owner"
}
