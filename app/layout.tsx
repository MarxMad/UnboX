import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { PinProvider } from "@/lib/pin-context"
import { NotificationContainer } from "@/components/Notification"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "UnboX - Tokenize Your Streetwear",
  description: "The social platform for tokenizing streetwear, art toys, and luxury collectibles on Solana",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.className} font-sans antialiased`}>
        <AuthProvider>
          <PinProvider>
            {children}
            <NotificationContainer />
          </PinProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
