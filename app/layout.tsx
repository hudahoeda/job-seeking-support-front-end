import { Tektur } from "next/font/google"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"
import type { Metadata } from 'next'
import { Toaster } from "sonner"

const tektur = Tektur({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-tektur',
})

export const metadata: Metadata = {
  title: 'My Digital Academy',
  description: 'Digital Learning Platform',
  icons: {
    icon: [
      {
        url: 'https://mda-interview.sgp1.cdn.digitaloceanspaces.com/mda-logo.svg',
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
    <html lang="en" className={tektur.variable}>
      <body className={tektur.className}>
        <AuthProvider>
          {children}
          <Toaster 
            richColors 
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'var(--font-tektur)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}

