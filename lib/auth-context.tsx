"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { AuthResponse, UserResponse } from "./types"
import Cookies from 'js-cookie'
import { toast } from "sonner"

interface LoginResult {
  success: boolean
  error?: string
}

interface ErrorResponse {
  detail: string
}

interface AuthContextType {
  user: UserResponse | null
  login: (email: string, token: string) => Promise<LoginResult>
  logout: () => Promise<void>
  isLoading: boolean
  refreshUserData: () => Promise<UserResponse | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkUser = async () => {
    try {
      const token = Cookies.get("token")
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch("http://localhost:8000/api/v1/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData: UserResponse = await response.json()
        setUser(userData)
      } else {
        const errorData = await response.json()
        if (errorData.detail && errorData.detail.includes("Access expired")) {
          toast.error("Session Expired", {
            description: errorData.detail,
            duration: 5000,
          })
        }
        Cookies.remove("token")
      }
    } catch (error) {
      console.error("Error checking user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkUser()
  }, [])

  const refreshUserData = useCallback(async (): Promise<UserResponse | null> => {
    try {
      setIsLoading(true)
      const token = Cookies.get("token")
      if (!token) {
        setUser(null)
        return null
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData: UserResponse = await response.json()
        setUser(userData)
        return userData
      } else {
        setUser(null)
        return null
      }
    } catch (error) {
      console.error("Error refreshing user data:", error)
      setUser(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, token: string): Promise<LoginResult> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(token)}`,
        {
          method: "POST",
        },
      )

      const data = await response.json()

      if (!response.ok) {
        const errorData = data as ErrorResponse
        if (errorData.detail && errorData.detail.includes("Access expired")) {
          return { success: false, error: errorData.detail }
        }
        return { success: false, error: "Invalid email or token" }
      }

      const authData = data as AuthResponse
      // Set cookie with token
      Cookies.set("token", authData.access_token, { 
        expires: 7, // 7 days
        path: '/',
        sameSite: 'strict'
      })
      setUser(authData.user)
      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  const logout = async () => {
    try {
      const token = Cookies.get("token")
      if (token) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        if (!response.ok) {
          console.error("Logout failed")
        }
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Always clear state and redirect
      Cookies.remove("token")
      setUser(null)
      window.location.href = "/login"
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

