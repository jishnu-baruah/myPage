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

function CopyrightOverlay() {
  return (
    <div className="fixed bottom-6 lg:bottom-10 left-6 lg:left-10 text-xs text-neutral-900 dark:text-neutral-100 z-50 pointer-events-none select-none">
      © Jishnu Baruah
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black dark:bg-[rgb(23,23,23)] dark:text-white">
        <BackgroundCanvas />
        <ClientLayout>
          <ThemeProvider>{children}</ThemeProvider>
        </ClientLayout>
      </body>
    </html>
  )
}

// Render the copyright overlay globally (outside the page tree)
if (typeof window !== 'undefined') {
  const copyrightDiv = document.createElement('div');
  document.body.appendChild(copyrightDiv);
  import('react-dom').then(ReactDOM => {
    ReactDOM.render(<CopyrightOverlay />, copyrightDiv);
  });
}
