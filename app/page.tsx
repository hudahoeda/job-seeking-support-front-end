"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"
  
export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/brief')
    }
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">My Digital Academy</span>
            <span className="block text-blue-600 mt-2">Async Video Interview</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Showcase your skills and personality through our innovative asynchronous video interview platform. Take the interview at your own pace, anytime, anywhere.
          </p>
          <div className="mt-10">
            {!isLoading && !user ? (
              <Link href="/login">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                  Begin Your Interview
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

