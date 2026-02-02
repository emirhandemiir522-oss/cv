import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
    try {
        const { jobDescription, currentResume } = await req.json()

        if (!jobDescription || !currentResume) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const prompt = `
        You are an expert CV Optimizer.
        
        Job Description:
        ${jobDescription}

        Current CV JSON:
        ${JSON.stringify(currentResume)}

        Task:
        1. Analyze the fit between the CV and the Job Description.
        2. Identify missing keywords and skills.
        3. Suggest improvements for the Professional Summary to better match the job.
        4. Suggest improvements for Experience bullet points to highlight relevant achievements.

        Output JSON format:
        {
            "matchScore": 75,
            "missingKeywords": ["React", "Typescript", "AWS"],
            "suggestedSummary": "Optimized summary here...",
            "improvements": [
                { "section": "Experience", "suggestion": "In your role at X, emphasize your usage of Y tool..." }
            ]
        }
        `

        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'system', content: 'You are a helpful career assistant.' }, { role: 'user', content: prompt }],
            response_format: { type: "json_object" },
        })

        const content = completion.choices[0].message.content
        const result = content ? JSON.parse(content) : null

        return NextResponse.json({ data: result })
    } catch (e: any) {
        console.error('Optimization error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
