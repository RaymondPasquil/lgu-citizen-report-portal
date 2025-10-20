import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { statusId, note } = await request.json()

    // Get current incident for old status
    const currentIncident = await prisma.incident.findUnique({
      where: { id },
      include: {
        status: true,
        priority: true,
        category: true,
      }
    })

    if (!currentIncident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      )
    }

    // Update incident status
    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: {
        statusId: parseInt(statusId),
        updatedAt: new Date(),
      },
      include: {
        status: true,
        priority: true,
        category: true,
      }
    })

    // Create update record
    await prisma.incidentUpdate.create({
      data: {
        incidentId: id,
        oldStatus: currentIncident.statusId,
        newStatus: parseInt(statusId),
        note: note || `Status changed to ${updatedIncident.status.name}`,
        actorId: null, // In a real app, this would be the current user's profile ID
      }
    })

    // Send notification for status change
    try {
      const notificationResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          incidentId: id,
          type: 'status_update',
          message: note || `Status changed from ${currentIncident.status.name} to ${updatedIncident.status.name}`,
        }),
      })

      if (notificationResponse.ok) {
        const notificationResult = await notificationResponse.json()
        console.log('Notification sent:', notificationResult.summary)
      }
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError)
      // Don't fail the update if notification fails
    }

    return NextResponse.json({
      success: true,
      incident: updatedIncident,
    })

  } catch (error) {
    console.error('Error updating incident:', error)
    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500 }
    )
  }
}