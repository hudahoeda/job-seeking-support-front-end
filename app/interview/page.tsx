"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileVideo, CheckCircle2, Video, RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Cookies from 'js-cookie'

const questions = [
  {
    id: 1,
    title: "Self-Introduction",
    question: "Can you briefly introduce yourself, your background, and what excites you about joining this program?",
    tip: "Be concise and highlight key details about yourself in 1-2 minutes."
  },
  {
    id: 2,
    title: "Innovation and Digital Transformation Mindset",
    question: "What role do you think digital transformation plays in shaping the future of banking? Can you share an example of an innovation or technology that could significantly impact the banking industry?"
  },
  {
    id: 3,
    title: "Analytical Thinking and Problem-Solving",
    question: "If you were tasked with analyzing why a bank's YoY revenue decreased by 10%, what steps would you take to identify the root cause?"
  },
  {
    id: 4,
    title: "Motivational Fit and Resilience",
    question: "Describe a challenging project or task you worked on. How did you approach it, and what did you learn that could help you in this bootcamp?"
  }
]

const RETRY_COUNT_KEY = 'interview_retry_count'
const INITIAL_RETRY_COUNT = 2 // 2 retries left after first attempt

function formatTimeRemaining(milliseconds: number) {
  if (milliseconds <= 0) return "Time Expired"
  
  const seconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return `${hours}h ${minutes}m ${remainingSeconds}s`
}

export default function InterviewPage() {
  const { logout, user, isLoading, refreshUserData } = useAuth()
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [retryCount, setRetryCount] = useState(INITIAL_RETRY_COUNT)
  const [isVideoTooLarge, setIsVideoTooLarge] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const questionsRef = useRef<HTMLDivElement>(null)

  // Check if video is already uploaded from user data
  const isVideoUploaded = user?.video_upload?.upload_status === "completed"

  useEffect(() => {
    // Refresh user data only once when component mounts
    refreshUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Remove refreshUserData from dependencies to prevent loops

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
      } else if (remaining <= 300000 && remaining > 299000 && isMounted) {
        toast.warning("Session Ending Soon", {
          description: "Your session will expire in 5 minutes. Please complete your interview.",
        })
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

  useEffect(() => {
    return () => {
      // Cleanup: Stop media tracks when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [stream])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.muted = true // Mute to prevent feedback
      }
    } catch (error) {
      console.error('Camera access error:', error);  // Actually use the error
      toast.error("Camera access failed", {
        description: "Please ensure you have granted camera and microphone permissions.",
      })
    }
  }

  const startRecording = () => {
    if (!stream) return

    setIsVideoTooLarge(false)
    
    const videoTrack = stream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.applyConstraints({
        width: 1280,
        height: 720,
        frameRate: 24
      }).catch(console.error)
    }

    const options = {
      mimeType: 'video/mp4;codecs=h264',
      videoBitsPerSecond: 1500000,
      audioBitsPerSecond: 128000
    }

    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/mp4'
    }

    const mediaRecorder = new MediaRecorder(stream, options)
    const chunks: Blob[] = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/mp4' })
      if (blob.size > 100 * 1024 * 1024) {
        setIsVideoTooLarge(true)
        toast.error("Video size too large", {
          description: "Please try recording a shorter video.",
        })
        return
      }
      
      const file = new File([blob], 'interview-recording.mp4', { type: 'video/mp4' })
      setSelectedFile(file)
    }

    mediaRecorder.start(1000)
    mediaRecorderRef.current = mediaRecorder
    setIsRecording(true)
    setRecordingTime(0)

    // Set maximum recording time to 15 minutes (900 seconds)
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 900) { // 15 minutes
          stopRecording()
          return prev
        }
        return prev + 1
      })
    }, 1000)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const handleRetry = () => {
    if (retryCount > 0) {
      const newRetryCount = retryCount - 1
      setRetryCount(newRetryCount)
      localStorage.setItem(RETRY_COUNT_KEY, newRetryCount.toString())
      setSelectedFile(null)
      setRecordingTime(0)
    }
  }

  const formatRecordingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setIsUploading(true)
      const token = Cookies.get("token")
      
      if (!token) {
        toast.error("Authentication error", {
          description: "Please log in again.",
        })
        return
      }

      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/videos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        const cleanErrorMessage = errorData.detail.replace(/\d+:\s*/, '')
        console.error('Response error:', cleanErrorMessage)
        throw new Error(cleanErrorMessage || 'Upload failed')
      }

      // Just wait for the response without assigning it
      await response.json()
      
      toast.success("Upload successful", {
        description: "Your video has been uploaded successfully.",
      })
      setSelectedFile(null)
      
      // Refresh user data and wait for the result
      const updatedUser = await refreshUserData()
      
      // Double-check the upload status with proper type checking
      if (updatedUser && updatedUser.video_upload?.upload_status !== "completed") {
        // Wait briefly and try one more time
        setTimeout(async () => {
          await refreshUserData()
        }, 1000)
      }
      
    } catch (error: unknown) {
      console.error('Error occurred:', error)
      const errorMessage = error instanceof Error ? error.message : "There was an error uploading your video. Please try again."
      toast.error("Upload failed", {
        description: errorMessage,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const scrollToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
    const questionElements = questionsRef.current?.getElementsByClassName('question-item')
    if (questionElements && questionElements[index]) {
      questionElements[index].scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      scrollToQuestion(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      scrollToQuestion(currentQuestionIndex - 1)
    }
  }

  // Update video preview only after recording stops and we have a file
  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;

    if (!isRecording && selectedFile) {
      // Show recorded video
      const videoURL = URL.createObjectURL(selectedFile);
      videoElement.srcObject = null;
      videoElement.src = videoURL;
      videoElement.muted = false;
      videoElement.controls = true; // Add controls for recorded video
      return () => URL.revokeObjectURL(videoURL);
    } else if (stream) {
      // Show live camera feed
      videoElement.srcObject = stream;
      videoElement.muted = true;
      videoElement.controls = false; // No controls for live feed
    }

    // Cleanup function
    return () => {
      if (videoElement.src) {
        URL.revokeObjectURL(videoElement.src);
      }
      if (videoElement.srcObject) {
        videoElement.srcObject = null;
      }
    };
  }, [isRecording, selectedFile, stream]); // Added stream to dependencies

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-grow p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="p-8">
              <div className="flex justify-center items-center">
                <Upload className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading...</span>
              </div>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (isVideoUploaded) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header onLogout={logout} />
        <div className="flex-grow p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-end">
              <div className="text-sm text-gray-600">
                Time Remaining: <span className="font-mono">{formatTimeRemaining(timeRemaining)}</span>
              </div>
            </div>
            
            <Card className="p-8 space-y-6">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold">Interview Submission Complete</h2>
                <p className="text-gray-600 max-w-md">
                  Thank you for submitting your video interview. Your submission has been received and is being processed. 
                  You may now close this window or log out.
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
    <div className="min-h-screen bg-white flex flex-col">
      <Header onLogout={logout} />
      <div className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Video Interview</h1>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  Time Remaining: <span className="font-mono">{formatTimeRemaining(timeRemaining)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-7 space-y-6">
                <Card className="p-6">
                  <div className="space-y-6">
                    {/* Question Navigation */}
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Interview Questions</h2>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                          Question {currentQuestionIndex + 1} of {questions.length}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousQuestion}
                          disabled={currentQuestionIndex === 0}
                          className="w-[100px]"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        
                        <div className="flex space-x-1">
                          {questions.map((_, index) => (
                            <div
                              key={index}
                              className={`h-1.5 w-6 rounded-full transition-colors ${
                                index === currentQuestionIndex ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextQuestion}
                          disabled={currentQuestionIndex === questions.length - 1}
                          className="w-[100px]"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>

                    {/* Question Content */}
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {questions[currentQuestionIndex].title}
                        </h3>
                        <p className="text-gray-700 text-lg">
                          {questions[currentQuestionIndex].question}
                        </p>
                        {questions[currentQuestionIndex].tip && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                              <span className="font-medium">Tip:</span> {questions[currentQuestionIndex].tip}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Recording Instructions</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Ensure you are in a quiet, well-lit environment</li>
                    <li>Speak clearly and maintain eye contact with the camera</li>
                    <li>Maximum recording time: 15 minutes total</li>
                    <li>Answer all questions in one continuous recording</li>
                  </ul>
                </Card>
              </div>

              <div className="md:col-span-5">
                <Card className="p-6 sticky top-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Recording Preview</h3>
                      <div className="text-sm text-muted-foreground">
                        Attempts remaining: <span className="font-medium text-foreground">{retryCount + 1}</span>
                      </div>
                    </div>

                    {!stream ? (
                      <div className="text-center p-8">
                        <Video className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold">Camera not started</h3>
                        <p className="mt-1 text-sm text-gray-500">Start your camera to begin recording</p>
                        <Button onClick={startCamera} className="mt-4">
                          Start Camera
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className={`w-full h-full ${!isRecording && selectedFile ? 'object-contain' : 'object-cover'}`}
                          />
                          {isRecording && (
                            <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-sm flex items-center gap-2">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                              {formatRecordingTime(recordingTime)}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          {!isRecording && !selectedFile && (
                            <Button onClick={startRecording} disabled={isVideoUploaded} className="w-full">
                              Start Recording
                            </Button>
                          )}
                          {isRecording && (
                            <Button onClick={stopRecording} variant="destructive" className="w-full">
                              Stop Recording
                            </Button>
                          )}
                          {selectedFile && !isUploading && (
                            <div className="flex gap-4 w-full">
                              <Button onClick={handleRetry} disabled={retryCount === 0} variant="outline" className="flex-1">
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Retry
                              </Button>
                              <Button onClick={handleUpload} className="flex-1">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload
                              </Button>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {isUploading && (
                      <div className="text-center">
                        <FileVideo className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
                        <h3 className="mt-2 text-sm font-semibold">Uploading video...</h3>
                        <p className="mt-1 text-sm text-gray-500">Please wait while we upload your recording</p>
                      </div>
                    )}

                    {isVideoUploaded && (
                      <div className="text-center">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                        <h3 className="mt-2 text-sm font-semibold text-green-600">Video uploaded successfully!</h3>
                      </div>
                    )}

                    {isVideoTooLarge && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          Your recording is too large (max 100MB). Please try recording a shorter video or at a lower quality.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

