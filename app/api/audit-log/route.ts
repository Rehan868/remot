import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const { userId, action, entityType, entityId, details } = await request.json()

    const supabase = createClient()

    // Insert the audit log entry
    // Now that entity_id is nullable, we can insert null if it's not provided
    const { data, error } = await supabase
      .from("audit_logs")
      .insert({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId || null, // Can be null now
        details,
      })
      .select()

    if (error) {
      console.error("Error inserting audit log:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in audit log API route:", error)
    return NextResponse.json({ error: "Failed to create audit log" }, { status: 500 })
  }
}
