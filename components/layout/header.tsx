"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { UserCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface HeaderProps {
  onLogout?: () => void
}

export function Header({ onLogout }: HeaderProps) {
  const { user } = useAuth()

  return (
    <nav className="border-b fixed top-0 left-0 right-0 bg-white z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="https://mda-interview.sgp1.cdn.digitaloceanspaces.com/merintis-asset/logo-merintis.svg"
                alt="Merintis Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-gray-900">Merintis</span>
            </Link>   
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <UserCircle className="h-8 w-8 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.user_data.email}
                  </span>
                </div>
                {onLogout && (
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 hover:text-gray-900" 
                    onClick={onLogout}
                  >
                    Logout
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-[#003974] hover:bg-[#002d5a] text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 