import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { incidentId, type, recipientEmail, message } = await request.json()

    // Get incident details
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId },
      include: {
        status: true,
        priority: true,
        category: true,
      }
    })

    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      )
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Create notification message based on type
    let notificationMessage = ''
    let subject = ''

    switch (type) {
      case 'status_update':
        subject = `Update on your report: ${incident.caseCode}`
        notificationMessage = `
Dear Citizen,

Your report "${incident.title}" (Case Code: ${incident.caseCode}) has been updated.

Current Status: ${incident.status.name}
Priority: ${incident.priority.name}
Category: ${incident.category?.name || 'N/A'}

${message || 'No additional details provided.'}

You can track your report at: https://lgu-reports.gov.ph/

Thank you for your patience and cooperation.

Best regards,
LGU Service Team
        `
        break

      case 'sla_breach':
        subject = `Urgent: Report ${incident.caseCode} Requires Attention`
        notificationMessage = `
Dear LGU Staff,

URGENT: The following report has breached its SLA target:

Case Code: ${incident.caseCode}
Title: ${incident.title}
Priority: ${incident.priority.name}
Status: ${incident.status.name}
Category: ${incident.category?.name || 'N/A'}

This incident requires immediate attention to restore service level compliance.

Please take appropriate action immediately.

System Notification
        `
        break

      case 'new_report':
        subject = `New Report Submitted: ${incident.caseCode}`
        notificationMessage = `
Dear LGU Staff,

A new report has been submitted:

Case Code: ${incident.caseCode}
Title: ${incident.title}
Priority: ${incident.priority.name}
Category: ${incident.category?.name || 'N/A'}
Status: ${incident.status.name}

Please review and take appropriate action.

System Notification
        `
        break

      default:
        notificationMessage = message || 'Notification from LGU Report System'
        subject = `LGU Report Notification: ${incident.caseCode}`
    }

    // In a real implementation, you would send this via email/SMS
    // For now, we'll use ZAI to generate a summary and log it
    const summary = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a notification system for a local government unit. Summarize the following notification in a professional and concise manner.'
        },
        {
          role: 'user',
          content: `Subject: ${subject}\n\nMessage: ${notificationMessage}`
        }
      ],
      max_tokens: 150,
      temperature: 0.3,
    })

    const notificationSummary = summary.choices[0]?.message?.content || notificationMessage

    // Log notification (in production, you'd store this in a notifications table)
    console.log('Notification sent:', {
      incidentId,
      type,
      recipient: recipientEmail || 'system',
      subject,
      summary: notificationSummary,
      timestamp: new Date().toISOString(),
    })

    // Store notification in database (optional)
    await prisma.incidentUpdate.create({
      data: {
        incidentId,
        note: `Notification sent: ${type} - ${subject}`,
        actorId: null, // System action
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      summary: notificationSummary,
    })

  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const incidentId = searchParams.get('incidentId')

    if (!incidentId) {
      return NextResponse.json(
        { error: 'Incident ID is required' },
        { status: 400 }
      )
    }

    // Get notification history for an incident
    const updates = await prisma.incidentUpdate.findMany({
      where: {
        incidentId,
        note: {
          contains: 'Notification sent:'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const notifications = updates.map(update => ({
      id: update.id,
      type: update.note?.replace('Notification sent: ', '').split(' - ')[0] || 'unknown',
      subject: update.note?.split(' - ')[1] || 'No subject',
      createdAt: update.createdAt,
    }))

    return NextResponse.json(notifications)

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}