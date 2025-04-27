"use client"

import { Button } from "@/components/ui/button"
import { Grid, List } from "lucide-react"

interface ViewToggleProps {
  view: "grid" | "list"
  onViewChange: (view: "grid" | "list") => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex border rounded-md overflow-hidden">
      <Button
        variant="ghost"
        size="sm"
        className={`rounded-none px-3 ${view === "list" ? "bg-muted" : ""}`}
        onClick={() => onViewChange("list")}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`rounded-none px-3 ${view === "grid" ? "bg-muted" : ""}`}
        onClick={() => onViewChange("grid")}
      >
        <Grid className="h-4 w-4" />
      </Button>
    </div>
  )
}
