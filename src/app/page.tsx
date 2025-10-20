'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import CameraCapture from '@/components/camera-capture'
import { AlertCircle, Camera, MapPin, FileText, Search, Zap, Clock, Target } from 'lucide-react'
import { toast } from 'sonner'

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    priorityId: '2',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    isPublic: true,
  })
  const [attachments, setAttachments] = useState<File[]>([])
  const [trackingCode, setTrackingCode] = useState('')
  const [searchResult, setSearchResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          formDataToSend.append(key, value.toString())
        }
      })
      
      attachments.forEach((file, index) => {
        formDataToSend.append(`attachment_${index}`, file)
      })

      const response = await fetch('/api/incidents', {
        method: 'POST',
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error('Failed to submit report')
      }

      const result = await response.json()
      toast.success(`Report submitted successfully! Your tracking code is: ${result.caseCode}`)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        categoryId: '',
        priorityId: '2',
        address: '',
        latitude: null,
        longitude: null,
        isPublic: true,
      })
      setAttachments([])
    } catch (error) {
      toast.error('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTrack = async () => {
    if (!trackingCode) return

    try {
      const response = await fetch(`/api/incidents/${trackingCode}`)
      if (!response.ok) {
        throw new Error('Incident not found')
      }
      const result = await response.json()
      setSearchResult(result)
    } catch (error) {
      toast.error('Incident not found')
      setSearchResult(null)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }))
          toast.success('Location captured successfully')
        },
        (error) => {
          toast.error('Failed to get location')
        }
      )
    }
  }

  const autoFillReport = async () => {
    setIsAutoFilling(true)
    try {
      // Simulate AI-powered auto-fill with z-ai-web-dev-sdk
      const response = await fetch('/api/autofill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: formData.categoryId,
          priority: formData.priorityId,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setFormData(prev => ({
          ...prev,
          title: result.title || prev.title,
          description: result.description || prev.description,
          address: result.address || prev.address,
        }))
        toast.success('Report auto-filled with AI assistance')
      }
    } catch (error) {
      // Fallback to predefined templates
      const templates = {
        '1': {
          title: 'Pothole on Main Street',
          description: 'Large pothole causing traffic hazard, approximately 2 feet wide and 6 inches deep. Located near the intersection with Oak Avenue.',
          address: 'Main Street, near Oak Avenue'
        },
        '2': {
          title: 'Overflowing Public Trash Bin',
          description: 'Public trash bin overflowing with garbage, spreading onto sidewalk. Health hazard and attracting pests.',
          address: 'Central Park Entrance'
        },
        '3': {
          title: 'Water Main Leak',
          description: 'Significant water leak from underground pipe, water flowing onto street. Possible main break requiring immediate attention.',
          address: 'Corner of Elm Street and 2nd Avenue'
        },
        '4': {
          title: 'Illegal Dumping Site',
          description: 'Large pile of construction debris and household waste illegally dumped. Environmental hazard and eyesore.',
          address: 'Empty lot behind Community Center'
        }
      }

      const template = templates[formData.categoryId as keyof typeof templates]
      if (template) {
        setFormData(prev => ({
          ...prev,
          title: template.title,
          description: template.description,
          address: template.address,
        }))
        toast.success('Report template applied')
      }
    } finally {
      setIsAutoFilling(false)
    }
  }

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center py-8">
          <div className="text-center flex-1">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent mb-3">
              LGU Citizen Report Portal
            </h1>
            <p className="text-xl text-black font-medium">
              Report issues in your community and track their resolution
            </p>
          </div>
        </header>

        {/* Navigation */}
        <div className="flex justify-center gap-3 mb-8">
          <Button variant="outline" asChild className="border-orange-200 text-black hover:bg-orange-50 hover:border-orange-400 transition-all duration-200">
            <a href="/dashboard" className="font-medium">⚙️ Admin Dashboard</a>
          </Button>
          <Button variant="outline" asChild className="border-orange-200 text-black hover:bg-orange-50 hover:border-orange-400 transition-all duration-200">
            <a href="/sla" className="font-medium">📊 SLA Monitor</a>
          </Button>
          <Button variant="outline" asChild className="border-orange-200 text-black hover:bg-orange-50 hover:border-orange-400 transition-all duration-200">
            <a href="/transparency" className="font-medium">👁️ Public Transparency</a>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Report Form */}
          <Card className="shadow-lg border-orange-100">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-black">File a Report</span>
              </CardTitle>
              <CardDescription className="text-black font-medium">
                Report issues like potholes, waste problems, water leaks, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="orange-gradient-input p-4 rounded-lg border-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-black mb-2 block">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of the issue"
                    required
                    className="bg-transparent text-base font-medium placeholder:text-gray-400"
                  />
                </div>

                <div className="orange-gradient-input p-4 rounded-lg border-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-black mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the issue"
                    rows={3}
                    className="bg-transparent text-base font-medium placeholder:text-gray-400 resize-none"
                  />
                </div>

                <div className="orange-gradient-input p-4 rounded-lg border-2">
                  <Label htmlFor="category" className="text-sm font-semibold text-black mb-2 block">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                    <SelectTrigger className="bg-transparent border-0 text-base font-medium">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1" className="font-medium">🚧 Road & Drainage</SelectItem>
                      <SelectItem value="2" className="font-medium">🗑️ Waste Management</SelectItem>
                      <SelectItem value="3" className="font-medium">💧 Water Supply</SelectItem>
                      <SelectItem value="4" className="font-medium">🏥 Public Health</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="orange-gradient-input p-4 rounded-lg border-2">
                  <Label htmlFor="priority" className="text-sm font-semibold text-black mb-2 block">
                    Priority Level
                  </Label>
                  <Select value={formData.priorityId} onValueChange={(value) => setFormData(prev => ({ ...prev, priorityId: value }))}>
                    <SelectTrigger className="bg-transparent border-0 text-base font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1" className="font-medium">🟢 Low Priority</SelectItem>
                      <SelectItem value="2" className="font-medium">🟡 Normal Priority</SelectItem>
                      <SelectItem value="3" className="font-medium">🔴 High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="orange-gradient-input p-4 rounded-lg border-2">
                  <Label htmlFor="address" className="text-sm font-semibold text-black mb-2 block">
                    Address / Location
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter the address or location"
                    className="bg-transparent text-base font-medium placeholder:text-gray-400"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    className="flex items-center gap-2 border-orange-200 text-black hover:bg-orange-50 hover:border-orange-400 transition-all duration-200 font-medium"
                  >
                    <MapPin className="h-4 w-4" />
                    Get Current Location
                  </Button>
                  {formData.latitude && formData.longitude && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 font-medium">
                      ✅ Location captured
                    </Badge>
                  )}
                </div>

                {/* Camera Capture */}
                <div>
                  <Label className="text-sm font-semibold text-black mb-3 block">
                    📸 Photos & Evidence
                  </Label>
                  <CameraCapture
                    onPhotosChange={setAttachments}
                    maxPhotos={5}
                  />
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <input
                    type="checkbox"
                    id="public"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="rounded border-orange-300 text-orange-500 focus:ring-orange-500 w-4 h-4"
                  />
                  <Label htmlFor="public" className="text-sm font-medium text-white cursor-pointer">
                    Make this report public (visible on transparency page)
                  </Label>
                </div>

                {/* Automation Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={autoFillReport}
                    disabled={isAutoFilling || !formData.categoryId}
                    className="automation-button text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {isAutoFilling ? 'Auto-filling...' : '🤖 Auto-Fill with AI'}
                  </Button>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full automation-button text-white font-bold text-lg py-4 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <div className="loading-spinner mr-2"></div>
                      Submitting Report...
                    </>
                  ) : (
                    <>
                      📤 Submit Report
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Tracking Section */}
          <Card className="shadow-lg border-orange-100">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-black">Track Your Report</span>
              </CardTitle>
              <CardDescription className="text-black font-medium">
                Enter your tracking code to check the status of your report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="orange-gradient-input p-4 rounded-lg border-2">
                <Input
                  placeholder="Enter tracking code (e.g., PRV-2024-000001)"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  className="bg-transparent border-0 text-base font-medium placeholder:text-black"
                />
              </div>
              
              <Button onClick={handleTrack} className="w-full automation-button text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                <Search className="h-4 w-4 mr-2" />
                🔍 Track Report
              </Button>

              {searchResult && (
                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-semibold">{searchResult.title}</h3>
                    <p className="text-sm text-black">Tracking Code: {searchResult.caseCode}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={searchResult.status === 'Resolved' ? 'default' : 'secondary'}>
                      {searchResult.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Priority:</span>
                    <Badge variant="outline">{searchResult.priority}</Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Description:</p>
                    <p className="text-sm text-black">{searchResult.description || 'No description provided'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Address:</p>
                    <p className="text-sm text-black">{searchResult.address || 'No address provided'}</p>
                  </div>

                  <div className="text-xs text-black">
                    <p>Submitted: {new Date(searchResult.createdAt).toLocaleDateString()}</p>
                    <p>Last Updated: {new Date(searchResult.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="text-sm text-black">Report Submission</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Camera className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">Photo</p>
                  <p className="text-sm text-black">Evidence Upload</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">GPS</p>
                  <p className="text-sm text-black">Location Tracking</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}