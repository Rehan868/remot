import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Get IP from request headers
  const forwardedFor = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")

  // Use the first IP from x-forwarded-for, or x-real-ip, or a fallback
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "unknown"

  return NextResponse.json({ ip })
}
