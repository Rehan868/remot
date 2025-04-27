import Link from "next/link"
import Image from "next/image"

import { LoginForm } from "@/components/login-form"

export default function OwnerLoginPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4 bg-cover bg-center"
      style={{
        backgroundImage: "url('/cerulean-flow.png')",
      }}
    >
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Image src="/abstract-geometric-logo.png" alt="Company Logo" width={120} height={16} className="mb-2" />
          <h2 className="text-center text-2xl font-semibold tracking-tight text-white">Owner Portal</h2>
          <p className="text-center text-sm text-gray-200">Secure access for property owners</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-md">
          <LoginForm userType="owner" />
        </div>

        <div className="text-center text-sm">
          <Link href="/login" className="text-sm text-gray-200 underline underline-offset-4 hover:text-white">
            Staff Login
          </Link>
        </div>
      </div>
    </div>
  )
}
