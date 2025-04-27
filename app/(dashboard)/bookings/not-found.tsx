import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function BookingNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-muted-foreground mb-8">The booking page you are looking for does not exist.</p>
      <Button asChild>
        <Link href="/bookings">Return to Bookings</Link>
      </Button>
    </div>
  )
}
