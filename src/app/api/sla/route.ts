import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const checkEscalation = searchParams.get('checkEscalation') === 'true'

    // Get all incidents that are not resolved or rejected
    const activeIncidents = await prisma.incident.findMany({
      where: {
        statusId: {
          notIn: [5, 6] // Not Resolved or Rejected
        }
      },
      include: {
        priority: true,
        status: true,
        category: true,
      }
    })

    const now = new Date()
    const slaBreaches: any[] = []
    const upcomingBreaches: any[] = []

    for (const incident of activeIncidents) {
      const createdAt = new Date(incident.createdAt)
      const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
      const targetHours = incident.priority.targetHours
      const percentageUsed = (hoursElapsed / targetHours) * 100

      const slaData = {
        id: incident.id,
        caseCode: incident.caseCode,
        title: incident.title,
        priority: incident.priority.name,
        status: incident.status.name,
        category: incident.category?.name,
        targetHours,
        hoursElapsed: Math.round(hoursElapsed * 100) / 100,
        percentageUsed: Math.round(percentageUsed * 100) / 100,
        createdAt: incident.createdAt,
        timeRemaining: Math.max(0, targetHours - hoursElapsed),
      }

      // Check if SLA is breached
      if (hoursElapsed > targetHours) {
        slaBreaches.push(slaData)
        
        // Auto-escalate if requested
        if (checkEscalation && incident.statusId !== 4) { // Not already "On Hold"
          await prisma.incident.update({
            where: { id: incident.id },
            data: {
              statusId: 4, // Set to "On Hold"
              updatedAt: now,
            }
          })

          await prisma.incidentUpdate.create({
            data: {
              incidentId: incident.id,
              oldStatus: incident.statusId,
              newStatus: 4,
              note: `Auto-escalated due to SLA breach. Target: ${targetHours}h, Elapsed: ${Math.round(hoursElapsed)}h`,
              actorId: null, // System action
            }
          })

          // Send SLA breach notification
          try {
            const notificationResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                incidentId: incident.id,
                type: 'sla_breach',
                message: `SLA breach: ${incident.title} (${incident.caseCode}) - Target: ${targetHours}h, Elapsed: ${Math.round(hoursElapsed)}h`,
              }),
            })

            if (notificationResponse.ok) {
              const notificationResult = await notificationResponse.json()
              console.log('SLA breach notification sent:', notificationResult.summary)
            }
          } catch (notificationError) {
            console.error('Failed to send SLA breach notification:', notificationError)
            // Don't fail the escalation if notification fails
          }
        }
      }
      // Check if SLA is about to be breached (within 20% of target time)
      else if (percentageUsed > 80) {
        upcomingBreaches.push(slaData)
      }
    }

    // Calculate SLA statistics
    const totalIncidents = activeIncidents.length
    const breachedCount = slaBreaches.length
    const upcomingCount = upcomingBreaches.length
    const complianceRate = totalIncidents > 0 ? Math.round(((totalIncidents - breachedCount) / totalIncidents) * 100) : 100

    const statistics = {
      totalActiveIncidents: totalIncidents,
      slaBreaches: breachedCount,
      upcomingBreaches: upcomingCount,
      complianceRate,
      averageResolutionTime: await calculateAverageResolutionTime(),
    }

    return NextResponse.json({
      statistics,
      slaBreaches,
      upcomingBreaches,
      allIncidents: activeIncidents.map(incident => ({
        id: incident.id,
        caseCode: incident.caseCode,
        title: incident.title,
        priority: incident.priority.name,
        status: incident.status.name,
        category: incident.category?.name,
        targetHours: incident.priority.targetHours,
        hoursElapsed: Math.round(((now.getTime() - new Date(incident.createdAt).getTime()) / (1000 * 60 * 60)) * 100) / 100,
        percentageUsed: Math.round((((now.getTime() - new Date(incident.createdAt).getTime()) / (1000 * 60 * 60)) / incident.priority.targetHours) * 100 * 100) / 100,
      }))
    })

  } catch (error) {
    console.error('Error checking SLA:', error)
    return NextResponse.json(
      { error: 'Failed to check SLA status' },
      { status: 500 }
    )
  }
}

async function calculateAverageResolutionTime(): Promise<number> {
  try {
    const resolvedIncidents = await prisma.incident.findMany({
      where: {
        statusId: 5 // Resolved
      },
      include: {
        priority: true,
      }
    })

    if (resolvedIncidents.length === 0) return 0

    const totalHours = resolvedIncidents.reduce((sum, incident) => {
      const hours = (new Date(incident.updatedAt).getTime() - new Date(incident.createdAt).getTime()) / (1000 * 60 * 60)
      return sum + hours
    }, 0)

    return Math.round((totalHours / resolvedIncidents.length) * 100) / 100
  } catch (error) {
    console.error('Error calculating average resolution time:', error)
    return 0
  }
}