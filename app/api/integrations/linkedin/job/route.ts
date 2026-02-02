import { NextResponse } from 'next/server'
import { scrapeLinkedInJob } from '@/lib/apify'

export async function POST(req: Request) {
    try {
        const { jobUrl } = await req.json()
        if (!jobUrl) return NextResponse.json({ error: 'Job URL required' }, { status: 400 })

        // Basic validation
        if (!jobUrl.includes('linkedin.com')) {
            return NextResponse.json({ error: 'Invalid LinkedIn Job URL' }, { status: 400 })
        }

        const jobData = await scrapeLinkedInJob(jobUrl)

        if (!jobData) return NextResponse.json({ error: 'Failed to scrape job' }, { status: 500 })

        return NextResponse.json({ data: jobData })
    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message || 'Scrape failed' }, { status: 500 })
    }
}
