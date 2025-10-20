import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const incident = await prisma.incident.findFirst({
      where: {
        OR: [
          { caseCode: id },
          { id: id }
        ]
      },
      include: {
        category: true,
        priority: true,
        status: true,
        attachments: true,
        updates: {
          include: {
            actor: {
              select: {
                fullName: true,
                role: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      )
    }

    // Return public information only
    const publicIncident = {
      caseCode: incident.caseCode,
      title: incident.title,
      description: incident.description,
      address: incident.address,
      status: incident.status.name,
      priority: incident.priority.name,
      category: incident.category?.name,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,
      updates: incident.updates.map(update => ({
        note: update.note,
        oldStatus: update.oldStatus,
        newStatus: update.newStatus,
        createdAt: update.createdAt,
        actor: update.actor?.fullName || 'System',
      }))
    }

    return NextResponse.json(publicIncident)

  } catch (error) {
    console.error('Error fetching incident:', error)
    return NextResponse.json(
      { error: 'Failed to fetch incident' },
      { status: 500 }
    )
  }
}