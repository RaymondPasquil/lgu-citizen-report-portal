'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, X, Upload, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface CameraCaptureProps {
  onPhotosChange: (photos: File[]) => void
  maxPhotos?: number
}

export default function CameraCapture({ onPhotosChange, maxPhotos = 5 }: CameraCaptureProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      })
      
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      
      setIsCameraOpen(true)
      toast.success('Camera access granted')
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error('Failed to access camera. Please check permissions.')
      
      // Fallback to file upload
      if (fileInputRef.current) {
        fileInputRef.current.click()
      }
    }
  }

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCameraOpen(false)
    setCapturedImage(null)
  }, [stream])

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, {
              type: 'image/jpeg'
            })
            
            const newPhotos = [...photos, file]
            if (newPhotos.length <= maxPhotos) {
              setPhotos(newPhotos)
              onPhotosChange(newPhotos)
              setCapturedImage(URL.createObjectURL(file))
              toast.success('Photo captured successfully')
            } else {
              toast.error(`Maximum ${maxPhotos} photos allowed`)
            }
          }
        }, 'image/jpeg', 0.9)
      }
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    setPhotos(newPhotos)
    onPhotosChange(newPhotos)
    toast.success('Photo removed')
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const newPhotos = [...photos, ...files].slice(0, maxPhotos)
    setPhotos(newPhotos)
    onPhotosChange(newPhotos)
    
    if (files.length > 0) {
      toast.success(`${files.length} photo(s) added`)
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
  }

  const confirmPhoto = () => {
    setCapturedImage(null)
    stopCamera()
  }

  return (
    <div className="space-y-4">
      {/* Camera View */}
      {isCameraOpen && (
        <Card className="relative shadow-lg border-orange-100">
          <CardContent className="p-0">
            <div className="camera-preview h-64 md:h-96">
              {capturedImage ? (
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
              <div className="camera-overlay">
                <div className="camera-controls">
                  {capturedImage ? (
                    <>
                      <Button onClick={retakePhoto} variant="secondary" size="sm" className="font-medium">
                        🔄 Retake
                      </Button>
                      <Button onClick={confirmPhoto} size="sm" className="automation-button text-white font-medium">
                        ✅ Confirm
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={capturePhoto} size="sm" className="automation-button text-white font-medium">
                        <Camera className="h-4 w-4 mr-2" />
                        📸 Capture
                      </Button>
                      <Button onClick={stopCamera} variant="destructive" size="sm" className="font-medium">
                        <X className="h-4 w-4" />
                        ❌ Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="photo-grid">
          {photos.map((photo, index) => (
            <div key={index} className="photo-item">
              <img
                src={URL.createObjectURL(photo)}
                alt={`Photo ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              <button
                onClick={() => removePhoto(index)}
                className="remove-btn"
                aria-label="Remove photo"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3">
        {!isCameraOpen && (
          <>
            <Button
              onClick={startCamera}
              className="automation-button text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={photos.length >= maxPhotos}
            >
              <Camera className="h-4 w-4 mr-2" />
              📷 Open Camera
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={photos.length >= maxPhotos}
              className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-400 font-medium transition-all duration-200"
            >
              <Upload className="h-4 w-4 mr-2" />
              📁 Choose Files
            </Button>
          </>
        )}
        
        {photos.length > 0 && !isCameraOpen && (
          <Button
            onClick={() => {
              setPhotos([])
              onPhotosChange([])
              toast.success('All photos cleared')
            }}
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-400 font-medium transition-all duration-200"
          >
            <X className="h-4 w-4 mr-2" />
            🗑️ Clear All
          </Button>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Photo Count */}
      <div className="text-sm font-medium text-white bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg border border-orange-200 dark:border-orange-800">
        📸 {photos.length} / {maxPhotos} photos
      </div>
    </div>
  )
}