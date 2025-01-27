"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onLogout?: () => void
}

export function Header({ onLogout }: HeaderProps) {
  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="https://mda-interview.sgp1.cdn.digitaloceanspaces.com/mda-logo.svg"
                alt="My Digital Academy Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-gray-900">My Digital Academy</span>
            </Link>
          </div>
          {onLogout && (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900" onClick={onLogout}>
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
} 