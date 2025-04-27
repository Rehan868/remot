"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { ChevronLeft, ChevronRight, LogOut, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavItemProps {
  href: string
  icon: React.ElementType
  label: string
  collapsed: boolean
  onClick?: () => void
}

const NavItem = ({ href, icon: Icon, label, collapsed, onClick }: NavItemProps) => {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative w-full text-left",
          collapsed ? "justify-center" : "",
          "text-foreground/70 hover:bg-accent hover:text-foreground",
        )}
      >
        <Icon className={cn("h-5 w-5 transition-transform", !collapsed && "group-hover:scale-110")} />
        {!collapsed && <span>{label}</span>}
        {collapsed && (
          <div className="fixed left-16 rounded-md px-2 py-1 ml-6 bg-popover text-foreground shadow-md opacity-0 -translate-x-3 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap z-[99999] border border-border/50">
            {label}
          </div>
        )}
      </button>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative",
        collapsed ? "justify-center" : "",
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-foreground/70 hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon className={cn("h-5 w-5 transition-transform", !collapsed && "group-hover:scale-110")} />
      {!collapsed && <span>{label}</span>}
      {collapsed && (
        <div className="fixed left-16 rounded-md px-2 py-1 ml-6 bg-popover text-foreground shadow-md opacity-0 -translate-x-3 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap z-[99999] border border-border/50">
          {label}
        </div>
      )}
    </Link>
  )
}

export function OwnerSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login/owner")
  }

  return (
    <div
      className={cn(
        "h-screen sticky top-0 bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between h-16 px-3 border-b border-border">
        {!collapsed && <div className="font-semibold text-lg tracking-tight">Owner Portal</div>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("rounded-full", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-grow overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          <NavItem href="/dashboard/owner" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
        </div>
      </div>

      <div className="p-2 border-t border-border">
        <NavItem href="#" icon={LogOut} label="Logout" collapsed={collapsed} onClick={handleLogout} />
      </div>
    </div>
  )
}
