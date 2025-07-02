import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-toggle"
import ClientLayout from "@/components/client-layout"
import BackgroundCanvas from "@/components/background-canvas"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
})

export const metadata: Metadata = {
  title: "Jishnu Baruah - Builder & Technologist",
  description: "Portfolio of Jishnu Baruah",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black dark:bg-[rgb(23,23,23)] dark:text-white min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5">
        <ThemeProvider>
          <div className="w-full">
            <div className="global-border-wrapper relative border-2 border-neutral-400 dark:border-neutral-600 p-1 sm:p-2 md:p-3 rounded-xl shadow-lg overflow-hidden h-[calc(100vh-1rem)] sm:h-[calc(100vh-1.5rem)] md:h-[calc(100vh-2.5rem)]">
              <BackgroundCanvas />
              <div className="relative z-10">
                {children}
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
