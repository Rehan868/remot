"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Calendar,
  Home,
  Settings,
  Users,
  BookOpen,
  DollarSign,
  Brush,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCheck,
  ClipboardList,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Simple navigation item component with no complex state or handlers
function SimpleNavItem({
  href,
  icon: Icon,
  label,
  collapsed,
  isActive,
}: {
  href: string
  icon: React.ElementType
  label: string
  collapsed: boolean
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md group relative",
        collapsed ? "justify-center" : "",
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-foreground/70 hover:bg-accent hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{label}</span>}
      {collapsed && (
        <div className="fixed left-16 rounded-md px-2 py-1 ml-6 bg-popover text-foreground shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-0 whitespace-nowrap z-10 border border-border/50">
          {label}
        </div>
      )}
    </Link>
  )
}

// Simple button that looks like a nav item but triggers a function
function SimpleNavButton({
  icon: Icon,
  label,
  collapsed,
  onClick,
}: {
  icon: React.ElementType
  label: string
  collapsed: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md w-full text-left group relative",
        collapsed ? "justify-center" : "",
        "text-foreground/70 hover:bg-accent hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{label}</span>}
      {collapsed && (
        <div className="fixed left-16 rounded-md px-2 py-1 ml-6 bg-popover text-foreground shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-0 whitespace-nowrap z-10 border border-border/50">
          {label}
        </div>
      )}
    </button>
  )
}

// Simple navigation group
function SimpleNavGroup({
  title,
  collapsed,
  children,
}: {
  title: string
  collapsed: boolean
  children: React.ReactNode
}) {
  return (
    <div className="mb-6">
      {!collapsed && (
        <div className="text-xs font-semibold text-foreground/50 uppercase tracking-wider px-3 mb-2">{title}</div>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  
  // Simple handlers with no complex state management
  const handleCollapse = () => setCollapsed(prev => !prev)
  
  // Enhanced logout handler with fallback mechanisms
  const handleLogout = () => {
    try {
      // First attempt - try using the router
      router.push("/login");
      
      // Fallback in case router fails - use direct navigation after a short delay
      setTimeout(() => {
        try {
          // Check if navigation happened
          if (window.location.pathname !== "/login") {
            // If not, use direct navigation methods
            window.location.href = "/login";
          }
        } catch (e) {
          // Last resort - use location.replace
          window.location.replace("/login");
        }
      }, 200);
    } catch (e) {
      // Ultimate fallback
      window.location.href = "/login";
    }
  }
  
  return (
    <nav
      aria-label="Main Navigation"
      className={cn(
        "h-screen sticky top-0 bg-card border-r border-border flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-16 px-3 border-b border-border">
        {!collapsed && <div className="font-semibold text-lg tracking-tight">HotelManager</div>}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn("rounded-full", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-grow overflow-y-auto py-4 px-2">
        <SimpleNavGroup title="Overview" collapsed={collapsed}>
          <SimpleNavItem 
            href="/dashboard" 
            icon={Home} 
            label="Dashboard" 
            collapsed={collapsed} 
            isActive={pathname === "/dashboard" || pathname.startsWith("/dashboard/")}
          />
          <SimpleNavItem 
            href="/bookings" 
            icon={BookOpen} 
            label="Bookings" 
            collapsed={collapsed}
            isActive={pathname === "/bookings" || pathname.startsWith("/bookings/")}
          />
          <SimpleNavItem 
            href="/availability" 
            icon={Calendar} 
            label="Availability" 
            collapsed={collapsed}
            isActive={pathname === "/availability" || pathname.startsWith("/availability/")}
          />
        </SimpleNavGroup>

        <SimpleNavGroup title="Management" collapsed={collapsed}>
          <SimpleNavItem 
            href="/rooms" 
            icon={Home} 
            label="Rooms" 
            collapsed={collapsed}
            isActive={pathname === "/rooms" || pathname.startsWith("/rooms/")}
          />
          <SimpleNavItem 
            href="/expenses" 
            icon={DollarSign} 
            label="Expenses" 
            collapsed={collapsed}
            isActive={pathname === "/expenses" || pathname.startsWith("/expenses/")}
          />
          <SimpleNavItem 
            href="/cleaning" 
            icon={Brush} 
            label="Cleaning Status" 
            collapsed={collapsed}
            isActive={pathname === "/cleaning" || pathname.startsWith("/cleaning/")}
          />
        </SimpleNavGroup>

        <SimpleNavGroup title="Administration" collapsed={collapsed}>
          <SimpleNavItem 
            href="/users" 
            icon={Users} 
            label="Users" 
            collapsed={collapsed}
            isActive={pathname === "/users" || pathname.startsWith("/users/")}
          />
          <SimpleNavItem 
            href="/owners" 
            icon={UserCheck} 
            label="Owners" 
            collapsed={collapsed}
            isActive={pathname === "/owners" || pathname.startsWith("/owners/")}
          />
          <SimpleNavItem 
            href="/reports" 
            icon={BarChart} 
            label="Reports" 
            collapsed={collapsed}
            isActive={pathname === "/reports" || pathname.startsWith("/reports/")}
          />
          <SimpleNavItem 
            href="/audit" 
            icon={ClipboardList} 
            label="Audit Logs" 
            collapsed={collapsed}
            isActive={pathname === "/audit" || pathname.startsWith("/audit/")}
          />
          <SimpleNavItem 
            href="/settings" 
            icon={Settings} 
            label="Settings" 
            collapsed={collapsed}
            isActive={pathname === "/settings" || pathname.startsWith("/settings/")}
          />
        </SimpleNavGroup>
      </div>

      <div className="p-2 border-t border-border">
        <SimpleNavButton
          icon={LogOut}
          label="Logout"
          collapsed={collapsed}
          onClick={handleLogout}
        />
      </div>
    </nav>
  )
}
