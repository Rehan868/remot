"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { RealtimeChannel } from '@supabase/supabase-js'

export function useRealTimeBookings() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const { toast } = useToast()
  // Create client only once and store in a ref
  const supabaseRef = useRef(createClient())
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    // Set up real-time subscription to bookings table
    if (channelRef.current) {
      // Already subscribed, no need to resubscribe
      return;
    }
    
    const supabase = supabaseRef.current;
    
    // Use debounced updates to prevent excessive re-renders
    let debounceTimer: NodeJS.Timeout | null = null;
    
    channelRef.current = supabase
      .channel("bookings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          // Debounce updates that come in bursts
          if (debounceTimer) clearTimeout(debounceTimer);
          
          debounceTimer = setTimeout(() => {
            console.log("Real-time update received:", payload)
            setLastUpdate(new Date())

            // Show a toast notification about the change
            const eventType = payload.eventType
            const bookingId = payload.new?.id || payload.old?.id
            
            if (!bookingId) return;

            if (eventType === "INSERT") {
              toast({
                title: "New Booking Created",
                description: `Booking #${bookingId.substring(0, 8)} has been created`,
              })
            } else if (eventType === "UPDATE") {
              toast({
                title: "Booking Updated",
                description: `Booking #${bookingId.substring(0, 8)} has been updated`,
              })
            } else if (eventType === "DELETE") {
              toast({
                title: "Booking Deleted",
                description: `Booking #${bookingId.substring(0, 8)} has been deleted`,
              })
            }
          }, 300); // Debounce for 300ms
        },
      )
      .subscribe((status) => {
        setIsSubscribed(status === 'SUBSCRIBED');
      });

    return () => {
      // Clean up subscription and debounce timer
      if (debounceTimer) clearTimeout(debounceTimer);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsSubscribed(false);
    }
  }, [toast]) // Only toast as dependency, supabase client is in ref

  return { isSubscribed, lastUpdate }
}
