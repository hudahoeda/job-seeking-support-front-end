import { Montserrat } from "next/font/google"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"
import type { Metadata } from 'next'
import { Toaster } from "sonner"

const montserrat = Montserrat({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'Merintis',
  description: 'Job Seeking Support Platform',
  icons: {
    icon: [
      {
        url: 'https://mda-interview.sgp1.cdn.digitaloceanspaces.com/merintis-asset/logo-merintis.svg',
        type: 'image/svg+xml',
      },
    ],
    // Also add a fallback .ico version
    shortcut: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className={montserrat.className}>
        <AuthProvider>
          {children}
          <Toaster 
            richColors 
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'var(--font-montserrat)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}

