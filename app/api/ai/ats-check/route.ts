import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
    try {
        const { resume } = await req.json()

        if (!resume) {
            return NextResponse.json({ error: 'Resume data required' }, { status: 400 })
        }

        const prompt = `
        You are an expert ATS (Applicant Tracking System) analyzer.
        
        Analyze the following resume JSON for ATS compatibility:
        ${JSON.stringify(resume)}

        Evaluate the resume based on these ATS criteria:
        1. **Keyword Optimization** (0-25 points): Does it contain industry-relevant keywords?
        2. **Format & Structure** (0-25 points): Is it well-structured with clear sections?
        3. **Contact Information** (0-15 points): Are all essential contact details present?
        4. **Experience Details** (0-20 points): Are job descriptions detailed with quantifiable achievements?
        5. **Skills Section** (0-15 points): Are skills clearly listed and relevant?

        Provide specific, actionable improvement suggestions for each category.

        Output JSON format:
        {
            "overallScore": 75,
            "categories": [
                {
                    "name": "Keyword Optimization",
                    "score": 18,
                    "maxScore": 25,
                    "status": "warning",
                    "feedback": "Your resume lacks industry-specific keywords. Consider adding..."
                },
                {
                    "name": "Format & Structure",
                    "score": 22,
                    "maxScore": 25,
                    "status": "good",
                    "feedback": "Well-structured resume with clear sections."
                },
                {
                    "name": "Contact Information",
                    "score": 10,
                    "maxScore": 15,
                    "status": "warning",
                    "feedback": "Missing LinkedIn profile URL."
                },
                {
                    "name": "Experience Details",
                    "score": 15,
                    "maxScore": 20,
                    "status": "warning",
                    "feedback": "Add more quantifiable achievements..."
                },
                {
                    "name": "Skills Section",
                    "score": 10,
                    "maxScore": 15,
                    "status": "good",
                    "feedback": "Good variety of skills listed."
                }
            ],
            "topImprovements": [
                "Add more industry-specific keywords like 'Agile', 'Scrum', etc.",
                "Include quantifiable achievements (e.g., 'Increased sales by 20%')",
                "Add your LinkedIn profile URL"
            ],
            "missingElements": ["LinkedIn URL", "Portfolio URL", "Certifications"]
        }
        
        Status should be: "good" (>=70%), "warning" (40-69%), or "critical" (<40%) based on category score percentage.
        `

        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: 'You are a helpful ATS expert. Always respond with valid JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: "json_object" },
        })

        const content = completion.choices[0].message.content
        const result = content ? JSON.parse(content) : null

        return NextResponse.json({ data: result })
    } catch (e: any) {
        console.error('ATS Check error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
