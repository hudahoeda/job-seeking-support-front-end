"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { toast } from "sonner"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [token, setToken] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    const result = await login(email, token)
    
    if (result.success) {
      router.refresh()
      router.push("/brief")
    } else {
      setError(result.error || "Login failed")
      if (result.error?.includes("Access expired")) {
        toast.error("Access Expired", {
          description: result.error,
        })
      } else {
        toast.error("Login Failed", {
          description: result.error || "Invalid email or token. Please try again.",
        })
      }
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <Image src="https://mda-interview.sgp1.cdn.digitaloceanspaces.com/merintis-asset/logo-merintis.svg" alt="Logo" width={200} height={60} priority />
            </div>
            <CardTitle className="text-2xl text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  disabled={isLoading}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="token">Token</Label>
                <Input 
                  id="token" 
                  type="password" 
                  value={token} 
                  onChange={(e) => setToken(e.target.value)} 
                  disabled={isLoading}
                  required 
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}

