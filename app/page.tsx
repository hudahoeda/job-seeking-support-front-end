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
            <span className="block text-7xl">Merintis</span>
            <span className="block text-[#003974] mt-2">Partner for your 
              </span>
              <span className="block text-[#003974] mt-2">Job Seeking Journey</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            We are a platform that provides job seekers with the tools and resources they need to find their dream job. We offer a wide range of services, including job search, resume writing, and interview preparation.
          </p>
          <div className="mt-10">
            {!isLoading && !user ? (
              <Link href="/login">
                <Button size="lg" className="bg-[#003974] hover:bg-[#002d5a] text-white px-8 py-3 text-lg">
                  Begin Your Journey
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

