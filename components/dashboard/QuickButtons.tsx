"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarPlus, UserPlus, BedDouble, CreditCard } from "lucide-react"

export function QuickButtons() {
  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-4 text-center">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="flex flex-col h-24 items-center justify-center" asChild>
          <Link href="/bookings/new">
            <CalendarPlus className="h-6 w-6 mb-2" />
            <span>New Booking</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-24 items-center justify-center" asChild>
          <Link href="/guests/new">
            <UserPlus className="h-6 w-6 mb-2" />
            <span>New Guest</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-24 items-center justify-center" asChild>
          <Link href="/rooms">
            <BedDouble className="h-6 w-6 mb-2" />
            <span>Room Status</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-24 items-center justify-center" asChild>
          <Link href="/payments">
            <CreditCard className="h-6 w-6 mb-2" />
            <span>Payments</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
