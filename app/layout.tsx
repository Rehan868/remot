import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"
import { SettingsProvider } from "@/contexts/settings-context"
import { AuthLogger } from "@/components/auth/auth-logger"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bookopia - Hotel Management System",
  description: "A comprehensive hotel management system",
  generator: 'v0.dev'
}

// Fix hydration issue with a high-priority event script
export function generateStaticParams() {
  return []
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Clear event queue to prevent stuck events
              window.addEventListener('load', function() {
                // Reset any stuck click states
                setTimeout(function() {
                  document.body.click();
                }, 0);
              });
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SettingsProvider>
            <AuthProvider>
              <AuthLogger />
              {children}
              <Toaster />
            </AuthProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
