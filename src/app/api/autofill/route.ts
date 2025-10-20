import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { category, priority } = await request.json()

    // Get category information
    const categoryInfo = await prisma.category.findUnique({
      where: { id: category },
      include: { department: true }
    })

    // Get priority information
    const priorityInfo = await prisma.priority.findUnique({
      where: { id: parseInt(priority) }
    })

    try {
      // Use ZAI to generate intelligent auto-fill content
      const zai = await ZAI.create()

      const prompt = `
Generate a realistic citizen report for the following category and priority:

Category: ${categoryInfo?.name || 'General Issue'}
Department: ${categoryInfo?.department?.name || 'General'}
Priority: ${priorityInfo?.name || 'Normal'}

Create a report with:
1. A concise, descriptive title (max 100 characters)
2. A detailed description (2-3 sentences)
3. A realistic address/location

The report should sound like it was written by a concerned citizen and be specific enough to be actionable.
      `

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant generating realistic citizen reports for a local government unit. Provide specific, actionable information.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      })

      const aiResponse = completion.choices[0]?.message?.content

      if (aiResponse) {
        // Parse the AI response to extract title, description, and address
        const lines = aiResponse.split('\n').filter(line => line.trim())
        
        let title = ''
        let description = ''
        let address = ''

        for (const line of lines) {
          if (line.toLowerCase().includes('title:') || line.toLowerCase().includes('subject:')) {
            title = line.replace(/^(title|subject):/i, '').trim()
          } else if (line.toLowerCase().includes('description:') || line.toLowerCase().includes('details:')) {
            description = line.replace(/^(description|details):/i, '').trim()
          } else if (line.toLowerCase().includes('address:') || line.toLowerCase().includes('location:')) {
            address = line.replace(/^(address|location):/i, '').trim()
          }
        }

        // If AI couldn't parse properly, use the whole response as description
        if (!title && !description) {
          title = `${categoryInfo?.name || 'Community Issue'} Report`
          description = aiResponse.trim()
          address = 'Various locations throughout the community'
        }

        return NextResponse.json({
          title: title || `${categoryInfo?.name || 'Community Issue'} Report`,
          description: description || 'Please provide more details about this issue for proper action.',
          address: address || 'Location to be specified'
        })
      }
    } catch (aiError) {
      console.error('AI auto-fill failed:', aiError)
    }

    // Fallback to predefined templates if AI fails
    const templates = {
      '1': { // Road & Drainage
        title: 'Road Damage/Drainage Issue',
        description: 'Significant road damage or drainage problem requiring immediate attention. This issue poses safety risks to motorists and pedestrians.',
        address: 'Main thoroughfare in the area'
      },
      '2': { // Waste Management
        title: 'Waste Collection Issue',
        description: 'Problem with waste collection or illegal dumping that needs to be addressed for public health and environmental safety.',
        address: 'Public area or collection point'
      },
      '3': { // Water Supply
        title: 'Water Supply Problem',
        description: 'Issue with water supply or leak that requires immediate attention to prevent water loss and ensure service continuity.',
        address: 'Water infrastructure location'
      },
      '4': { // Public Health
        title: 'Public Health Concern',
        description: 'Public health issue that requires attention from health authorities to ensure community wellbeing.',
        address: 'Public area or facility'
      }
    }

    const template = templates[category as keyof typeof templates] || {
      title: 'Community Issue Report',
      description: 'Issue reported by community member requiring attention from appropriate authorities.',
      address: 'Location to be specified'
    }

    return NextResponse.json(template)

  } catch (error) {
    console.error('Auto-fill error:', error)
    return NextResponse.json(
      { error: 'Failed to generate auto-fill content' },
      { status: 500 }
    )
  }
}