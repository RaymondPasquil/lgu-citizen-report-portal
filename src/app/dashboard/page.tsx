'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText, 
  MapPin, 
  User,
  Calendar,
  Filter,
  Search,
  Home,
  Settings,
  Users,
  Database,
  Shield,
  Bell,
  BarChart3,
  Download,
  Upload,
  Trash2,
  Edit,
  Plus,
  RefreshCw
} from 'lucide-react'

interface Incident {
  id: string
  caseCode: string
  title: string
  description: string
  status: string
  priority: string
  category?: string
  address?: string
  createdAt: string
  updatedAt: string
}

export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [updateNote, setUpdateNote] = useState('')
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    fetchIncidents()
  }, [])

  const fetchIncidents = async () => {
    try {
      const response = await fetch('/api/incidents')
      if (!response.ok) {
        console.error('Failed to fetch incidents:', response.status)
        return
      }
      const data = await response.json()
      setIncidents(data)
    } catch (error) {
      console.error('Failed to load incidents:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateIncidentStatus = async () => {
    if (!selectedIncident || !newStatus) return

    try {
      const response = await fetch(`/api/incidents/${selectedIncident.id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          statusId: parseInt(newStatus),
          note: updateNote,
        }),
      })

      if (!response.ok) {
        console.error('Failed to update incident:', response.status)
        return
      }

      setUpdateNote('')
      setNewStatus('')
      setSelectedIncident(null)
      fetchIncidents()
    } catch (error) {
      console.error('Failed to update incident:', error)
    }
  }

  const filteredIncidents = incidents.filter(incident => {
    const matchesStatus = filterStatus === 'all' || incident.status.toLowerCase() === filterStatus.toLowerCase()
    const matchesPriority = filterPriority === 'all' || incident.priority.toLowerCase() === filterPriority.toLowerCase()
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.caseCode.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesPriority && matchesSearch
  })

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

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'normal': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = {
    total: incidents.length,
    submitted: incidents.filter(i => i.status === 'Submitted').length,
    inProgress: incidents.filter(i => i.status === 'In Progress').length,
    resolved: incidents.filter(i => i.status === 'Resolved').length,
    high: incidents.filter(i => i.priority === 'High').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-black">Loading dashboard...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">⚙️ Admin Dashboard</h1>
              <p className="text-sm text-black">Manage system settings, incidents, and administrative functions</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild className="border-orange-200 text-black hover:bg-orange-50 hover:border-orange-400 transition-all duration-200">
                <a href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </a>
              </Button>
              <Button variant="outline" onClick={fetchIncidents}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Tabs */}
        <Tabs defaultValue="incidents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="incidents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Incidents
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Backup
            </TabsTrigger>
          </TabsList>

          {/* Incidents Tab */}
          <TabsContent value="incidents" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-sm text-black">Total Reports</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.submitted}</p>
                      <p className="text-sm text-black">Submitted</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.inProgress}</p>
                      <p className="text-sm text-black">In Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.resolved}</p>
                      <p className="text-sm text-black">Resolved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.high}</p>
                      <p className="text-sm text-black">High Priority</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Incidents List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Incident Management
                    </CardTitle>
                    <CardDescription>
                      Review and manage citizen reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="flex-1 orange-gradient-input p-3 rounded-lg border">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search by title or case code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-transparent border-0"
                          />
                        </div>
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="under review">Under Review</SelectItem>
                          <SelectItem value="in progress">In Progress</SelectItem>
                          <SelectItem value="on hold">On Hold</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Filter by priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Incidents List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredIncidents.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No incidents found matching your criteria
                        </div>
                      ) : (
                        filteredIncidents.map((incident) => (
                          <div
                            key={incident.id}
                            className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => setSelectedIncident(incident)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">{incident.title}</h3>
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
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {incident.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(incident.createdAt).toLocaleDateString()}
                              </div>
                              {incident.address && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate max-w-32">{incident.address}</span>
                                </div>
                              )}
                              {incident.category && (
                                <Badge variant="outline" className="text-xs">
                                  {incident.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Incident Details */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Incident Details</CardTitle>
                    <CardDescription>
                      View and update incident information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedIncident ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Case Code</Label>
                          <p className="text-sm text-gray-600">{selectedIncident.caseCode}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Title</Label>
                          <p className="text-sm text-gray-600">{selectedIncident.title}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Description</Label>
                          <p className="text-sm text-gray-600">{selectedIncident.description}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Status</Label>
                          <Badge className={getStatusColor(selectedIncident.status)}>
                            {selectedIncident.status}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Priority</Label>
                          <Badge className={getPriorityColor(selectedIncident.priority)}>
                            {selectedIncident.priority}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Update Status</Label>
                          <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select new status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Submitted</SelectItem>
                              <SelectItem value="2">Under Review</SelectItem>
                              <SelectItem value="3">In Progress</SelectItem>
                              <SelectItem value="4">On Hold</SelectItem>
                              <SelectItem value="5">Resolved</SelectItem>
                              <SelectItem value="6">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Update Note</Label>
                          <Textarea
                            placeholder="Add a note about this update..."
                            value={updateNote}
                            onChange={(e) => setUpdateNote(e.target.value)}
                            rows={3}
                          />
                        </div>
                        <Button onClick={updateIncidentStatus} className="w-full">
                          Update Incident
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Select an incident to view details
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  User management features coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure system parameters and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  System settings features coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  View system analytics and reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Analytics features coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup Tab */}
          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup & Maintenance</CardTitle>
                <CardDescription>
                  System backup and maintenance tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Backup features coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}