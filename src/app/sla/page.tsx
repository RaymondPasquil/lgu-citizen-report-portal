'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  Timer,
  RefreshCw,
  AlertCircle,
  Home
} from 'lucide-react'
import { toast } from 'sonner'

interface SLAData {
  statistics: {
    totalActiveIncidents: number
    slaBreaches: number
    upcomingBreaches: number
    complianceRate: number
    averageResolutionTime: number
  }
  slaBreaches: Array<{
    id: string
    caseCode: string
    title: string
    priority: string
    status: string
    category?: string
    targetHours: number
    hoursElapsed: number
    percentageUsed: number
    createdAt: string
    timeRemaining: number
  }>
  upcomingBreaches: Array<{
    id: string
    caseCode: string
    title: string
    priority: string
    status: string
    category?: string
    targetHours: number
    hoursElapsed: number
    percentageUsed: number
    createdAt: string
    timeRemaining: number
  }>
  allIncidents: Array<{
    id: string
    caseCode: string
    title: string
    priority: string
    status: string
    category?: string
    targetHours: number
    hoursElapsed: number
    percentageUsed: number
  }>
}

export default function SLADashboard() {
  const [slaData, setSlaData] = useState<SLAData | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoEscalating, setAutoEscalating] = useState(false)

  useEffect(() => {
    fetchSLAData()
  }, [])

  const fetchSLAData = async () => {
    try {
      const response = await fetch('/api/sla')
      if (!response.ok) throw new Error('Failed to fetch SLA data')
      const data = await response.json()
      setSlaData(data)
    } catch (error) {
      toast.error('Failed to load SLA data')
    } finally {
      setLoading(false)
    }
  }

  const handleAutoEscalate = async () => {
    setAutoEscalating(true)
    try {
      const response = await fetch('/api/sla?checkEscalation=true')
      if (!response.ok) throw new Error('Failed to escalate incidents')
      toast.success('SLA breaches escalated successfully')
      fetchSLAData()
    } catch (error) {
      toast.error('Failed to escalate incidents')
    } finally {
      setAutoEscalating(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'normal': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'under review': return 'bg-yellow-100 text-yellow-800'
      case 'in progress': return 'bg-purple-100 text-purple-800'
      case 'on hold': return 'bg-orange-100 text-orange-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-orange-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading SLA dashboard...</p>
        </div>
      </div>
    )
  }

  if (!slaData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Failed to load SLA data</h2>
          <Button onClick={fetchSLAData}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SLA Monitoring Dashboard</h1>
              <p className="text-sm text-gray-600">Service Level Agreement compliance and escalation management</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-400 transition-all duration-200">
                <a href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </a>
              </Button>
              <Button variant="outline" onClick={fetchSLAData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={handleAutoEscalate}
                disabled={autoEscalating || slaData.slaBreaches.length === 0}
                variant="destructive"
              >
                {autoEscalating ? 'Escalating...' : `Escalate Breaches (${slaData.slaBreaches.length})`}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* SLA Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Timer className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{slaData.statistics.totalActiveIncidents}</p>
                  <p className="text-sm text-gray-600">Active Incidents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{slaData.statistics.slaBreaches}</p>
                  <p className="text-sm text-gray-600">SLA Breaches</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{slaData.statistics.upcomingBreaches}</p>
                  <p className="text-sm text-gray-600">Upcoming Breaches</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{slaData.statistics.complianceRate}%</p>
                  <p className="text-sm text-gray-600">Compliance Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{slaData.statistics.averageResolutionTime}h</p>
                  <p className="text-sm text-gray-600">Avg Resolution</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SLA Breaches Alert */}
        {slaData.slaBreaches.length > 0 && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Immediate Action Required:</strong> {slaData.slaBreaches.length} incidents have breached their SLA targets. 
              Click "Escalate Breaches" to automatically update their status to "On Hold".
            </AlertDescription>
          </Alert>
        )}

        {/* Upcoming Breaches Warning */}
        {slaData.upcomingBreaches.length > 0 && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Attention:</strong> {slaData.upcomingBreaches.length} incidents are approaching their SLA limits (80%+ used).
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SLA Breaches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                SLA Breaches ({slaData.slaBreaches.length})
              </CardTitle>
              <CardDescription>
                Incidents that have exceeded their target resolution time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {slaData.slaBreaches.length === 0 ? (
                  <div className="text-center py-8 text-green-600">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                    <p>No SLA breaches</p>
                  </div>
                ) : (
                  slaData.slaBreaches.map((incident) => (
                    <div key={incident.id} className="border rounded-lg p-4 border-red-200 bg-red-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{incident.title}</h4>
                          <p className="text-sm text-gray-600">{incident.caseCode}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(incident.priority)}>
                            {incident.priority}
                          </Badge>
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Target: {incident.targetHours}h</span>
                          <span className="text-red-600 font-semibold">
                            {incident.hoursElapsed}h ({incident.percentageUsed}%)
                          </span>
                        </div>
                        <Progress value={100} className="h-2" />
                        <p className="text-xs text-gray-600">
                          Overdue by {Math.abs(incident.timeRemaining).toFixed(1)} hours
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Breaches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="h-5 w-5" />
                Upcoming Breaches ({slaData.upcomingBreaches.length})
              </CardTitle>
              <CardDescription>
                Incidents approaching their SLA limits (80%+ time used)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {slaData.upcomingBreaches.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-2" />
                    <p>No upcoming breaches</p>
                  </div>
                ) : (
                  slaData.upcomingBreaches.map((incident) => (
                    <div key={incident.id} className="border rounded-lg p-4 border-orange-200 bg-orange-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{incident.title}</h4>
                          <p className="text-sm text-gray-600">{incident.caseCode}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(incident.priority)}>
                            {incident.priority}
                          </Badge>
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Target: {incident.targetHours}h</span>
                          <span className="text-orange-600 font-semibold">
                            {incident.hoursElapsed}h ({incident.percentageUsed}%)
                          </span>
                        </div>
                        <Progress 
                          value={incident.percentageUsed} 
                          className="h-2"
                        />
                        <p className="text-xs text-gray-600">
                          {incident.timeRemaining.toFixed(1)} hours remaining
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Active Incidents */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>All Active Incidents</CardTitle>
            <CardDescription>
              Complete overview of all active incidents and their SLA status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {slaData.allIncidents.map((incident) => (
                <div key={incident.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{incident.title}</h4>
                      <p className="text-sm text-gray-600">{incident.caseCode}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(incident.priority)}>
                        {incident.priority}
                      </Badge>
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Target: {incident.targetHours}h</span>
                      <span className={incident.percentageUsed >= 100 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                        {incident.hoursElapsed}h ({incident.percentageUsed}%)
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(incident.percentageUsed, 100)} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}