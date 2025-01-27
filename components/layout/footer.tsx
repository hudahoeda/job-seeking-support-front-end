"use client"

import Image from "next/image"
import Link from "next/link"
import { Instagram, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t mt-auto bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
          <div className="flex flex-col items-start space-y-4">
            <Image
              src="https://mda-interview.sgp1.cdn.digitaloceanspaces.com/merintis-asset/logo-merintis-font.svg"
              alt="Merintis Logo"
              width={145}
              height={42}
              className="h-10 w-auto"
            />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">PT. Merintis Kehidupan</p>
              <p>Jl. Jenderal Gatot Subroto Kav. 36-38 Jakarta</p>
              <p>12190 Indonesia</p>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-4">
            <div className="flex items-center space-x-4">
              <Link href="https://www.instagram.com/mydigitalacademy_id/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-6 w-6" />
              </Link>
              <Link href="https://www.youtube.com/@MyDigitalAcademy" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <Youtube className="h-6 w-6" />
              </Link>
              <Link href="https://www.tiktok.com/@mydigitalacademy_id" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.321 5.562a5.122 5.122 0 0 1-.443-.258 6.228 6.228 0 0 1-1.138-1.009 6.268 6.268 0 0 1-1.362-2.618h.004a.312.312 0 0 0 .003-.029c0-.001-.004-.003-.004-.005H12.8v12.95c0 .666-.245 1.307-.688 1.796a2.666 2.666 0 0 1-1.78.824 2.706 2.706 0 0 1-2.78-2.618 2.706 2.706 0 0 1 2.78-2.618c.298 0 .583.048.852.137V8.421a7.357 7.357 0 0 0-.852-.049C7.085 8.372 4.6 10.841 4.6 13.977s2.485 5.605 5.532 5.605c3.047 0 5.532-2.469 5.532-5.605V8.261c1.072.822 2.373 1.302 3.736 1.302V6.041c-.749-.002-1.394-.171-1.984-.479h.004Z"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 