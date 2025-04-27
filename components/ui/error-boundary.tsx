"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
    this.setState({ errorInfo })
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="p-6 rounded-lg border border-red-200 bg-red-50 text-red-800 my-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Something went wrong</h2>
          </div>
          <div className="mb-4">
            <p>{this.state.error?.message || "An unexpected error occurred"}</p>
          </div>
          <details className="mb-4">
            <summary className="cursor-pointer text-sm font-medium">View error details</summary>
            <pre className="mt-2 whitespace-pre-wrap text-xs bg-white p-4 rounded border border-red-200 overflow-auto max-h-[300px]">
              {this.state.error?.stack}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null })
              window.location.reload()
            }}
          >
            Try again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
