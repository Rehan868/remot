import { createClient } from "@/lib/supabase-server"

type AuditLogParams = {
  userId: string
  userEmail?: string
  action: "create" | "update" | "delete" | "login" | "logout" | "view" | "export"
  entityType: string
  entityId?: string
  details?: string
  ipAddress?: string
  userAgent?: string
}

export async function logActivity({
  userId,
  userEmail,
  action,
  entityType,
  entityId,
  details,
  ipAddress,
  userAgent,
}: AuditLogParams) {
  const supabase = createClient()

  try {
    // If userEmail is not provided, try to get it from the users table
    if (!userEmail) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email")
        .eq("id", userId)
        .single()

      if (!userError && userData) {
        userEmail = userData.email
      }
    }

    // Insert the audit log
    const { error } = await supabase.from("audit_logs").insert({
      user_id: userId,
      user_email: userEmail,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    if (error) {
      console.error("Error logging activity:", error)
    }
  } catch (error) {
    console.error("Error in logActivity:", error)
  }
}
