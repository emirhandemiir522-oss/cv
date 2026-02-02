

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApifyClient } from 'apify-client'
import { GoogleGenerativeAI } from '@google/generative-ai'

const apify = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
})

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        let { resumeId, jobUrl, jobDescription } = await request.json()

        // 1. Fetch Resume Data (Smart Fallback)
        let resumeRecord;
        if (resumeId) {
            const { data } = await supabase.from('resumes').select('base_resume_json').eq('id', resumeId).single()
            resumeRecord = data;
        } else {
            // Fallback to latest resume (NOT a cover letter/kit)
            const { data } = await supabase
                .from('resumes')
                .select('base_resume_json')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10)

            if (data && data.length > 0) {
                resumeRecord = data.find((r: any) =>
                    r.base_resume_json?.type !== 'cover_letter' &&
                    r.base_resume_json?.type !== 'application_kit'
                )
            }
        }

        if (!resumeRecord) throw new Error('Resume not found. Please create a resume first.')
        const resume = resumeRecord.base_resume_json

        // 2. Fetch Job Details via Apify (if URL provided)
        let jobData: { description: string, title: string, company: string, logo?: string } = {
            description: jobDescription || '',
            title: 'Unknown Role',
            company: 'Unknown Company',
            logo: ''
        }

        if (jobUrl) {
            try {
                // Using the optimized parameters we set earlier
                const input = {
                    urls: [jobUrl],
                    maxItems: 1, // Only need 1 for this
                    includeCompanyDetails: true, // Need logo and nuances
                }
                const run = await apify.actor('curious_coder/linkedin-jobs-scraper').call(input, { waitSecs: 60 })
                const { items } = await apify.dataset(run.defaultDatasetId).listItems()

                if (items.length > 0) {
                    const item: any = items[0]
                    jobData = {
                        description: item.description || item.jobDescription || jobDescription,
                        title: item.title || item.jobTitle || 'Unknown Role',
                        company: item.companyName || item.company || 'Unknown Company',
                        logo: item.companyLogo || item.companyLogoUrl || ''
                    }
                }
            } catch (e) {
                console.error('Apify Error:', e)
            }
        }

        // 3. GENERATE APPLICATION KIT WITH GEMINI
        // We use a comprehensive prompt to generate everything in one go.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

        const prompt = `
            Role: Expert Career Coach & Presentation Designer.
            Task: Create a complete "Application Kit" for a candidate applying to a specific job.
            
            CANDIDATE:
            Name: ${resume.personalInfo?.name}
            Headline: ${resume.personalInfo?.headline}
            Core Skills: ${JSON.stringify(resume.skills)}
            Experience Summary: ${JSON.stringify(resume.experience?.slice(0, 3).map((e: any) => `${e.title} at ${e.company}: ${e.description.slice(0, 100)}...`))}

            TARGET JOB:
            Role: ${jobData.title}
            Company: ${jobData.company}
            Description: ${jobData.description.slice(0, 2000)}

            REQUIREMENTS:
            Generate a JSON object with 3 main sections:
            
            1. "cover_letter":
               - A highly professional, persuasive cover letter (HTML format).
               - Subject line suggestions included.
            
            2. "slides":
               - A 5-slide "Why Me?" presentation.
               - For each slide, provide:
                 - "title": Impactful headline.
                 - "bullets": Array of 3-4 key points (HTML allowed for bolding).
                 - "visual_cue": Description of an image/icon that would fit this slide (e.g. "Graph showing growth").
                 - "speaker_notes": What the candidate should say.
               - Structure:
                 Slide 1: Intro/Hook.
                 Slide 2: Understanding the Company/Problem.
                 Slide 3: My Solution/Skills.
                 Slide 4: Validated Experience (Proof).
                 Slide 5: Call to Action.

            3. "qa":
               - 10 Interview Questions likely to be asked for THIS specific role/company (Mix of Technical, Behavioral, Cultural).
               - "question": The question text.
               - "suggested_answer": A STAR-method based answer derived from the candidate's actual experience.
               - "rationale": Why this question is important.

            OUTPUT FORMAT:
            Valid JSON only. No markdown fences.
        `

        const result = await model.generateContent(prompt)
        const response = result.response
        const text = response.text()

        // Clean markdown fences if Gemini adds them
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const generatedData = JSON.parse(cleanedText)

        // 4. Save to DB
        // Storing as 'application_kit' type in table 'resumes' for now (NoSQL style)
        // This avoids migration blockers and works immediately.
        const newRecord = {
            user_id: user.id,
            name: `${jobData.company} - Application Kit`,
            base_resume_json: {
                type: 'application_kit', // NEW TYPE
                target_job: {
                    title: jobData.title,
                    company: jobData.company,
                    logo: jobData.logo,
                    url: jobUrl || '',
                    description: jobData.description.slice(0, 500)
                },
                content: generatedData, // { cover_letter, slides, qa }
                generated_at: new Date().toISOString()
            }
        }

        const { data: inserted, error } = await supabase
            .from('resumes')
            .insert(newRecord)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ success: true, id: inserted.id })

    } catch (error: any) {
        console.error('Generation Error:', error)
        return NextResponse.json({ error: error.message || 'Failed to generate kit' }, { status: 500 })
    }
}
