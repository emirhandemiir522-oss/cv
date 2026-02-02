import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { topic, audience, tone, slides = 8 } = await request.json()

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
        }

        const systemPrompt = `You are an expert presentation designer. Create a ${slides}-slide presentation about "${topic}".
        Audience: ${audience || 'General'}
        Tone: ${tone || 'Professional'}

        Output strictly valid JSON with this structure:
        {
          "title": "Main Presentation Title",
          "slides": [
            {
              "title": "Slide Title",
              "content": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
              "speakerNotes": "Notes for the speaker...",
              "imagePrompt": "A description of an image relevant to this slide, optimized for Unsplash search"
            }
          ]
        }
        
        Ensure the content is engaging, concise, and structured for a slide deck. Do not include markdown formatting, just raw JSON.`

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'system', content: systemPrompt }],
            model: 'gpt-4o', // Or gpt-3.5-turbo if cost is a concern
            response_format: { type: "json_object" },
        })

        const content = JSON.parse(completion.choices[0].message.content || '{}')

        // Generate a unique slug for future sharing
        const slug = `${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`

        // Save to Database
        const { data: presentation, error } = await supabase
            .from('presentations')
            .insert({
                user_id: user.id,
                title: content.title || topic,
                search_query: topic,
                content: content.slides,
                slug: slug,
                share_enabled_at: new Date().toISOString() // Start sharing timer immediately or on first share? Let's default to now for simplicity as per request "7 days link".
            })
            .select()
            .single()

        if (error) {
            console.error('Supabase Error:', error)
            throw new Error('Failed to save presentation')
        }

        return NextResponse.json(presentation)

    } catch (error) {
        console.error('Generation Error:', error)
        return NextResponse.json({ error: 'Failed to generate presentation' }, { status: 500 })
    }
}
