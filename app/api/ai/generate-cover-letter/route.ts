import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { ApifyClient } from 'apify-client'

export async function POST(request: Request) {
    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        const apify = new ApifyClient({ token: process.env.APIFY_API_TOKEN })
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        let { resumeId, jobUrl, jobDescription } = await request.json()

        // 1. Fetch Resume Data
        let resumeRecord;

        if (resumeId) {
            const { data } = await supabase
                .from('resumes')
                .select('base_resume_json')
                .eq('id', resumeId)
                .single()
            resumeRecord = data;
        } else {
            // Fallback to latest resume
            // Fetch recent items and filter in code to be safe with JSONB operators
            const { data } = await supabase
                .from('resumes')
                .select('base_resume_json')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10)

            if (data && data.length > 0) {
                // Find first item that is NOT a cover letter
                resumeRecord = data.find((r: any) => r.base_resume_json?.type !== 'cover_letter')
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
                const input = {
                    urls: [jobUrl],
                    maxItems: 1,
                    includeCompanyDetails: true
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
                // Fallback to provided description
            }
        }

        // 3. Generate Cover Letter
        const prompt = `
            You are an expert career consultant. Write a HIGHLY PROFESSIONAL, DETAILED, and PERSUASIVE cover letter.
            
            CANDIDATE:
            Name: ${resume.personalInfo?.name}
            Headline: ${resume.personalInfo?.headline}
            Experience: ${JSON.stringify(resume.experience?.slice(0, 3))}
            Skills: ${JSON.stringify(resume.skills)}

            TARGET JOB:
            Role: ${jobData.title}
            Company: ${jobData.company}
            Description: ${jobData.description.slice(0, 2000)}

            INSTRUCTIONS:
            - Analyze the company's needs based on the description.
            - Explain why the candidate is the PERFECT fit.
            - Use a formal letter structure (Dear Hiring Manager, etc.).
            - Be specific about how the candidate's experience solves functionality required by the job.
            - Output format: JSON object with keys: "subject", "body" (HTML formatted with <p>, <ul> etc.), "company_analysis" (short summary of what the company is looking for).
            - Do not include placeholders like "[Your Phone Number]" if you have the data. If missing, use placeholders.
        `

        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
        })

        const result = JSON.parse(completion.choices[0].message.content || '{}')

        // 4. Save to DB
        const newCoverLetter = {
            type: 'cover_letter',
            target_job: {
                title: jobData.title,
                company: jobData.company,
                logo: jobData.logo,
                url: jobUrl || '',
                description: jobData.description.slice(0, 500) // Store snippet
            },
            content: result,
            generated_at: new Date().toISOString()
        }

        const { data: inserted, error } = await supabase
            .from('resumes')
            .insert({
                user_id: user.id,
                title: `Cover Letter - ${jobData.company}`,
                base_resume_json: newCoverLetter
            })
            .select('id')
            .single()

        if (error) throw error

        return NextResponse.json({ success: true, id: inserted.id })

    } catch (error: any) {
        console.error('Cover letter error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
