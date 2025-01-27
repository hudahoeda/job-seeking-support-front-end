"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

// Add time formatting function
function formatTimeRemaining(milliseconds: number) {
  if (milliseconds <= 0) return "Time Expired"
  
  const seconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return `${hours}h ${minutes}m ${remainingSeconds}s`
}

export default function BriefPage() {
  const [isChecked, setIsChecked] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const router = useRouter()
  const { logout, user, isLoading, refreshUserData } = useAuth()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Check if video is already uploaded
  const isVideoUploaded = user?.video_upload?.upload_status === "completed"

  useEffect(() => {
    // Refresh user data when component mounts
    refreshUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Add time remaining calculation
  useEffect(() => {
    const accessExpiry = user?.access_expiry
    if (!accessExpiry || typeof accessExpiry !== 'string') return

    let isMounted = true

    const updateTimer = () => {
      if (!isMounted) return

      const expiryTime = new Date(accessExpiry).getTime()
      const now = Date.now()
      const remaining = Math.max(0, expiryTime - now)
      
      setTimeRemaining(remaining)

      if (remaining <= 0 && isMounted) {
        // Clear interval and logout
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        toast.error("Session Expired", {
          description: "Your session has expired. You will be logged out.",
        })
        setTimeout(() => {
          if (isMounted) {
            logout()
          }
        }, 2000)
      }
    }

    // Initial update
    updateTimer()

    // Set up interval
    const intervalId = setInterval(updateTimer, 1000)
    timerRef.current = intervalId

    return () => {
      isMounted = false
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [user?.access_expiry, logout])

  const handleNext = () => {
    if (isChecked) {
      router.push("/interview")
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onLogout={logout} />
        <div className="flex-grow p-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <div className="flex justify-center items-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
                <span className="ml-2">Loading...</span>
              </div>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Show completion state if interview is already completed
  if (isVideoUploaded) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onLogout={logout} />
        <div className="flex-grow p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Add time remaining display */}
            <div className="flex justify-end">
              <div className="text-sm text-muted-foreground">
                Time Remaining: <span className="font-mono">{formatTimeRemaining(timeRemaining)}</span>
              </div>
            </div>
            
            <Card className="p-8 space-y-6">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Interview Already Completed</h2>
                <p className="text-muted-foreground max-w-md">
                  You have already completed and submitted your video interview. 
                  Thank you for your participation.
                </p>
                <Button variant="outline" onClick={logout} className="mt-4">
                  Logout
                </Button>
              </div>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onLogout={logout} />
      <div className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Add time remaining display */}
            <div className="flex justify-end">
              <div className="text-sm text-muted-foreground">
                Time Remaining: <span className="font-mono">{formatTimeRemaining(timeRemaining)}</span>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Interview Brief - My Digital Academy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Introduction</h2>
                  <p>Welcome to the interview for the My Digital Academy (MDA) program! This brief is designed to outline the structure, instructions, and expectations for the interview process. The interview will focus on assessing your understanding of AI applications, problem-solving ability, and motivational fit for the program.</p>
                  
                  <h3 className="text-lg font-semibold mt-6">Interview Format</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Number of Questions: 4</li>
                    <li>Duration: 5 minutes per question, maximum 15 minutes for all questions</li>
                    <li>Response Style: One-way verbal responses (no discussion)</li>
                    <li>Platform: Recording</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-6">Recording Instructions</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Ensure you are in a quiet, well-lit environment</li>
                    <li>Test your camera and microphone before starting</li>
                    <li>Speak clearly and maintain eye contact with the camera</li>
                    <li>You cannot pause once you start a question</li>
                    <li>You can retry each question up to 2 times if needed</li>
                  </ul>

                  <h3 className="text-lg font-semibold mt-6">Interview Questions</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Question 1: Self-Introduction</h4>
                      <p className="italic">&quot;Can you briefly introduce yourself, your background, and what excites you about joining this program?&quot;</p>
                      <p className="text-sm text-muted-foreground mt-1">Tips: Be concise and highlight key details about yourself in 1-2 minutes.</p>
                    </div>

                    <div>
                      <h4 className="font-semibold">Question 2: Innovation and Digital Transformation Mindset</h4>
                      <p className="italic">&quot;What role do you think digital transformation plays in shaping the future of banking? Can you share an example of an innovation or technology that could significantly impact the banking industry?&quot;</p>
                    </div>

                    <div>
                      <h4 className="font-semibold">Question 3: Analytical Thinking and Problem-Solving</h4>
                      <p className="italic">&quot;If you were tasked with analyzing why a bank&apos;s YoY revenue decreased by 10%, what steps would you take to identify the root cause?&quot;</p>
                    </div>

                    <div>
                      <h4 className="font-semibold">Question 4: Motivational Fit and Resilience</h4>
                      <p className="italic">&quot;Describe a challenging project or task you worked on. How did you approach it, and what did you learn that could help you in this bootcamp?&quot;</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={isChecked}
                    onCheckedChange={(checked) => setIsChecked(checked as boolean)}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I have read and understood the interview instructions
                  </label>
                </div>
                <Button 
                  onClick={handleNext} 
                  disabled={!isChecked} 
                  className="w-full"
                >
                  Proceed to Interview
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

