import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form fields
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const categoryId = formData.get('categoryId') as string
    const priorityId = parseInt(formData.get('priorityId') as string)
    const address = formData.get('address') as string
    const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null
    const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null
    const isPublic = formData.get('isPublic') === 'true'

    // Generate case code
    const year = new Date().getFullYear()
    const count = await prisma.incident.count({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`)
        }
      }
    })
    const caseCode = `PRV-${year}-${String(count + 1).padStart(6, '0')}`

    // normalize IDs
    const categoryIdParsed = categoryId && /^\d+$/.test(categoryId) ? Number(categoryId) : null
    const priorityIdParsed = Number.isNaN(priorityId) ? null : priorityId

    // Create incident
    let incident
    try {
      incident = await prisma.incident.create({
        data: {
          caseCode,
          title,
          description,
          categoryId: categoryIdParsed,
          priorityId: priorityIdParsed,
          address,
          latitude,
          longitude,
          isPublic,
          statusId: 1, // Submitted
        },
        include: {
          category: true,
          priority: true,
          status: true,
        }
      })
    } catch (prismaErr: any) {
      console.error('Prisma create incident error code:', prismaErr?.code)
      console.error('Prisma meta:', prismaErr?.meta)
      return NextResponse.json({ error: 'Failed to create incident (db error)' }, { status: 500 })
    }

    // Handle file attachments
    const attachments: string[] = []
    let index = 0
    while (formData.has(`attachment_${index}`)) {
      const file = formData.get(`attachment_${index}`) as File
      if (file) {
        // For now, just store the file name. In production, you'd upload to cloud storage
        const filePath = `incidents/${incident.id}/${file.name}`
        attachments.push(filePath)
        
        // Create attachment record
        await prisma.attachment.create({
          data: {
            incidentId: incident.id,
            filePath,
            mimeType: file.type,
          }
        })
      }
      index++
    }

    // Send notification for new report (if high priority)
    if (priorityId === 3) { // High priority
      try {
        const notificationResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            incidentId: incident.id,
            type: 'new_report',
            message: `New high priority report submitted: ${title}`,
          }),
        })

        if (notificationResponse.ok) {
          const notificationResult = await notificationResponse.json()
          console.log('High priority notification sent:', notificationResult.summary)
        }
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError)
        // Don't fail the creation if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      caseCode: incident.caseCode,
      id: incident.id,
    })

  } catch (error) {
    console.error('Error creating incident:', error)
    return NextResponse.json(
      { error: 'Failed to create incident' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')
    const publicOnly = searchParams.get('public') === 'true'

    const where: any = {}
    
    if (status) where.statusId = parseInt(status)
    if (category) where.categoryId = /^\d+$/.test(category) ? Number(category) : category
    if (priority) where.priorityId = parseInt(priority)
    if (publicOnly) where.isPublic = true

    const incidents = await prisma.incident.findMany({
      where,
      include: {
        category: true,
        priority: true,
        status: true,
        attachments: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(incidents)

  } catch (error) {
    console.error('Error fetching incidents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    )
  }
}