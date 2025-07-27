"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Camera, RotateCcw, Check, ArrowLeft, FlashlightOff, Flashlight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CameraCaptureProps {
  onPhotoCapture: (photo: string) => void
  onBack: () => void
}

export function CameraCapture({ onPhotoCapture, onBack }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [isFlashOn, setIsFlashOn] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })
      setStream(mediaStream)
      setHasPermission(true)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setHasPermission(false)
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        const photoDataUrl = canvas.toDataURL("image/jpeg", 0.9)
        setCapturedPhoto(photoDataUrl)
        stopCamera()
      }
    }
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

  const switchCamera = useCallback(() => {
    stopCamera()
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
  }, [stopCamera])

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [startCamera, stopCamera])

  if (hasPermission === false) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center text-white p-6">
          <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Camera Access Required</h2>
          <p className="text-gray-300 mb-6">Please allow camera access to capture menu photos</p>
          <div className="space-y-3">
            <Button onClick={startCamera} className="w-full bg-orange-500 hover:bg-orange-600">
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full bg-transparent text-white border-white hover:bg-white hover:text-black"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between p-4 pt-12">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/20">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-white font-semibold">Capture Menu</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFlashOn(!isFlashOn)}
            className="text-white hover:bg-white/20"
          >
            {isFlashOn ? <Flashlight className="h-5 w-5" /> : <FlashlightOff className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Camera View */}
      <div className="relative w-full h-full">
        {!capturedPhoto ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {/* Camera Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-4 border-2 border-white/30 rounded-lg">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg"></div>
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
                <p className="text-sm opacity-75">Position menu within frame</p>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent">
              <div className="flex items-center justify-center space-x-8 p-8">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={switchCamera}
                  className="text-white hover:bg-white/20 w-12 h-12 rounded-full"
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>

                <Button
                  onClick={capturePhoto}
                  className="w-20 h-20 rounded-full bg-white hover:bg-gray-100 border-4 border-white/50"
                >
                  <Camera className="h-8 w-8 text-black" />
                </Button>

                <div className="w-12 h-12"></div>
              </div>
            </div>
          </>
        ) : (
          <>
            <img src={capturedPhoto || "/placeholder.svg"} alt="Captured menu" className="w-full h-full object-cover" />

            {/* Photo Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent">
              <div className="flex items-center justify-center space-x-8 p-8">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={retakePhoto}
                  className="text-white hover:bg-white/20 w-12 h-12 rounded-full"
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>

                <Button
                  onClick={confirmPhoto}
                  className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 border-4 border-white/50"
                >
                  <Check className="h-8 w-8 text-white" />
                </Button>

                <div className="w-12 h-12"></div>
              </div>
            </div>
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
