"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase-client"
import { logInfo, logError } from "@/lib/debug-utils"

export default function PreviewLoginPage() {
  const [email, setEmail] = useState("staff@example.com")
  const [password, setPassword] = useState("password123")
  const [userType, setUserType] = useState<"staff" | "owner">("staff")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    setUserData(null)

    try {
      logInfo("Preview Login", `Login attempt for ${email} as ${userType}`)

      // For this preview, we'll directly query the app_users table
      const supabase = getSupabaseClient()

      const { data: users, error: queryError } = await supabase
        .from("app_users")
        .select("*")
        .eq("email", email)
        .eq("user_type", userType)
        .limit(1)

      if (queryError) {
        throw new Error(`Database error: ${queryError.message}`)
      }

      if (!users || users.length === 0) {
        throw new Error(`No ${userType} user found with this email`)
      }

      const user = users[0]

      // For this preview, we'll use a simple password check
      // In production, you should use bcrypt.compare
      if (password !== "password123") {
        throw new Error("Incorrect password")
      }

      setSuccess(`Successfully logged in as ${user.name} (${userType})`)
      setUserData(user)

      // In a real app, you would set up a session here
      logInfo("Preview Login", "Login successful", user)
    } catch (error) {
      logError("Preview Login", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUserType = () => {
    const newType = userType === "staff" ? "owner" : "staff"
    setUserType(newType)
    setEmail(newType === "staff" ? "staff@example.com" : "owner@example.com")
    setError(null)
    setSuccess(null)
    setUserData(null)
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Preview Login</CardTitle>
          <CardDescription>Test login with app_users table</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md text-sm">{success}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">For testing, use: password123</p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : `Login as ${userType}`}
            </Button>
          </form>

          {userData && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">User Data:</h3>
              <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">{JSON.stringify(userData, null, 2)}</pre>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={toggleUserType}>
            Switch to {userType === "staff" ? "owner" : "staff"} login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
