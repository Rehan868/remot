"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { debugSupabaseConnection } from "@/lib/supabase"
import { useState } from "react"

export default function DebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [result, setResult] = useState<any>(null)
  const supabaseDebug = debugSupabaseConnection()

  const testConnection = async () => {
    setConnectionStatus("testing")
    try {
      const result = await supabaseDebug.testConnection()
      setResult(result)
      setConnectionStatus(result.success ? "success" : "error")
    } catch (error) {
      setResult(error)
      setConnectionStatus("error")
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Debug Page</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Supabase Configuration</CardTitle>
          <CardDescription>Check if environment variables are properly set</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md">{JSON.stringify(supabaseDebug.getConfig(), null, 2)}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
          <CardDescription>Test if the application can connect to Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={testConnection}
            disabled={connectionStatus === "testing"}
            variant={
              connectionStatus === "idle"
                ? "default"
                : connectionStatus === "success"
                  ? "success"
                  : connectionStatus === "error"
                    ? "destructive"
                    : "outline"
            }
          >
            {connectionStatus === "idle" && "Test Connection"}
            {connectionStatus === "testing" && "Testing..."}
            {connectionStatus === "success" && "Connection Successful"}
            {connectionStatus === "error" && "Connection Failed"}
          </Button>

          {result && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[300px]">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
