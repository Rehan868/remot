"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export function LoginForm({ userType = "staff" }: { userType?: "staff" | "owner" }) {
  const [email, setEmail] = useState(userType === "owner" ? "owner@example.com" : "admin@example.com")
  const [password, setPassword] = useState("password123")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError(null)

    try {
      console.log(`Attempting to login with email: ${email}, userType: ${userType}, rememberMe: ${rememberMe}`)
      const result = await login(email, password, userType, rememberMe)

      if (!result.success) {
        setLoginError(result.error || "Invalid credentials")
        throw new Error(result.error || "Invalid credentials")
      }

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      })

      // Redirect based on user type - using absolute paths
      if (userType === "owner") {
        // For owner users
        console.log("Redirecting to owner dashboard...")
        router.push("/dashboard/owner")
      } else {
        // For staff users
        console.log("Redirecting to staff dashboard...")
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      {loginError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
          />
          <Label
            htmlFor="remember-me"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Remember me
          </Label>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Sign In"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          {userType === "owner" ? (
            <>
              Staff login?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Click here
              </Link>
            </>
          ) : (
            <>
              Property owner?{" "}
              <Link href="/login/owner" className="text-primary hover:underline">
                Owner login
              </Link>
            </>
          )}
        </p>
      </div>
      <div className="text-center text-xs text-muted-foreground">
        <p>Demo credentials: {userType === "owner" ? "owner@example.com" : "admin@example.com"} / password123</p>
      </div>
    </div>
  )
}
