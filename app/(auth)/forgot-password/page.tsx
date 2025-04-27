import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Image src="/abstract-geometric-logo.png" alt="Company Logo" width={120} height={16} className="mb-2" />
          <h2 className="text-center text-2xl font-semibold tracking-tight">Reset Password</h2>
          <p className="text-center text-sm text-muted-foreground">Enter your email to receive a password reset link</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@example.com" required />
            </div>
            <Button type="submit" className="w-full">
              Send Reset Link
            </Button>
          </form>
        </div>

        <div className="text-center text-sm">
          <Link href="/login" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
