"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, CalendarRange, Home, ClipboardList, PieChart, LogOut, Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is authenticated as owner
  useEffect(() => {
    const userType = localStorage.getItem("userType")
    if (!userType || userType !== "owner") {
      router.push("/login/owner")
    } else {
      setIsLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("userType")
    router.push("/login/owner")
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <nav className="grid gap-2 text-lg font-medium">
              <Link
                href="/dashboard/owner"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/owner/bookings"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <CalendarRange className="h-5 w-5" />
                Bookings
              </Link>
              <Link
                href="/owner/availability"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Home className="h-5 w-5" />
                Availability
              </Link>
              <Link
                href="/owner/cleaning"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ClipboardList className="h-5 w-5" />
                Cleaning Status
              </Link>
              <Link
                href="/owner/reports"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <PieChart className="h-5 w-5" />
                Reports
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Owner Portal</h1>
        </div>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src="/avatars/01.png" alt="Avatar" />
            <AvatarFallback>OW</AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-background md:block">
          <div className="flex h-full flex-col gap-2 p-4">
            <div className="px-2 py-2">
              <h2 className="px-4 text-lg font-semibold tracking-tight">Owner Portal</h2>
            </div>
            <nav className="grid gap-1 px-2 group">
              <Link
                href="/dashboard/owner"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/owner/bookings"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <CalendarRange className="h-5 w-5" />
                Bookings
              </Link>
              <Link
                href="/owner/availability"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Home className="h-5 w-5" />
                Availability
              </Link>
              <Link
                href="/owner/cleaning"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <ClipboardList className="h-5 w-5" />
                Cleaning Status
              </Link>
              <Link
                href="/owner/reports"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <PieChart className="h-5 w-5" />
                Reports
              </Link>
            </nav>
            <div className="mt-auto">
              <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </aside>
        <main className="flex-1 p-6 pt-0">{children}</main>
      </div>
    </div>
  )
}
