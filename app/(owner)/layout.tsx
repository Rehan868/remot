import type React from "react"
import { OwnerSidebar } from "@/components/owner-sidebar"
import { OwnerHeader } from "@/components/owner-header"
import { ProtectedRoute } from "@/components/protected-route"

export default function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute userType="owner">
      <div className="flex h-screen">
        <OwnerSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <OwnerHeader />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
