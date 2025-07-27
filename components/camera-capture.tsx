"use client"

import { useState, useRef, useCallback } from "react"
import { Camera, RotateCcw, X, Check, FlashlightOffIcon as FlashOff, FlashlightIcon as Flash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CameraCaptureProps {
  onPhotoCapture: (photo: string) => void
  onBack: () => void
}

export default function CameraCapture({ onPhotoCapture, onBack }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Unable to access camera. Please check permissions and try again.")
    } finally {
      setIsLoading(false)
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64
    const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8)
    setCapturedPhoto(photoDataUrl)
    stopCamera()
  }, [stopCamera])

  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null)
    startCamera()
  }, [startCamera])

  const confirmPhoto = useCallback(() => {
    if (capturedPhoto) {
      onPhotoCapture(capturedPhoto)
    }
  }, [capturedPhoto, onPhotoCapture])

  const toggleCamera = useCallback(() => {
    stopCamera()
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
  }, [stopCamera])

  // Start camera on mount
  useState(() => {
    startCamera()
    return () => stopCamera()
  })

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-white">Capture Menu</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Camera View */}
        <div className="flex-1 relative overflow-hidden">
          {error ? (
            <div className="flex items-center justify-center h-full p-6">
              <Alert className="max-w-md">
                <AlertDescription className="text-center">
                  {error}
                  <Button onClick={startCamera} className="mt-4 w-full" disabled={isLoading}>
                    {isLoading ? "Starting..." : "Try Again"}
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          ) : capturedPhoto ? (
            <div className="relative h-full">
              <img
                src={capturedPhoto || "/placeholder.svg"}
                alt="Captured menu"
                className="w-full h-full object-cover"
              />

              {/* Photo overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

              {/* Photo actions */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={retakePhoto}
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Retake
                  </Button>
                  <Button
                    size="lg"
                    onClick={confirmPhoto}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Use Photo
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative h-full">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

              {/* Camera overlay */}
              <div className="absolute inset-0">
                {/* Grid overlay for better composition */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-white/20" />
                  ))}
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* Camera controls */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center space-x-6">
                  {/* Flash toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFlashEnabled(!flashEnabled)}
                    className="text-white hover:bg-white/20"
                  >
                    {flashEnabled ? <Flash className="h-5 w-5" /> : <FlashOff className="h-5 w-5" />}
                  </Button>

                  {/* Capture button */}
                  <Button
                    size="lg"
                    onClick={capturePhoto}
                    disabled={!stream || isLoading}
                    className="w-16 h-16 rounded-full bg-white hover:bg-gray-100 p-0"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-amber-500" />
                  </Button>

                  {/* Camera flip */}
                  <Button variant="ghost" size="sm" onClick={toggleCamera} className="text-white hover:bg-white/20">
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 max-w-xs">
                  <Camera className="h-8 w-8 text-white mx-auto mb-2" />
                  <p className="text-white text-sm">
                    Position the menu clearly in the frame and tap the capture button
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}
