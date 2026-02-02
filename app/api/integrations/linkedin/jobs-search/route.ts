import { NextResponse } from 'next/server'
import { ApifyClient } from 'apify-client'

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN!,
})

export async function POST(req: Request) {
    try {
        const { keywords, location } = await req.json()

        if (!keywords) {
            return NextResponse.json({ error: 'Keywords required' }, { status: 400 })
        }

        // Construct LinkedIn Search URL
        const searchUrl = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(keywords)}${location ? `&location=${encodeURIComponent(location)}` : ''}&f_TPR=r86400`

        // curious_coder/linkedin-jobs-scraper requires 'urls' array
        const input = {
            urls: [searchUrl],
            maxItems: 10,
            includeCompanyDetails: true, // Needed for reliable titles/images
        }

        // Call scraper
        const run = await client.actor('curious_coder/linkedin-jobs-scraper').call(input, {
            waitSecs: 50, // Standard wait time for quality
        })

        // Fetch results
        const { items } = await client.dataset(run.defaultDatasetId).listItems()

        // Normalize the data for frontend
        const normalizedJobs = items.map((job: any) => ({
            title: job.title || job.jobTitle || 'Unknown Title',
            company: job.companyName || job.company || 'Unknown Company',
            location: job.location || job.jobLocation || '',
            url: job.jobUrl || job.url || job.link || '#',
            postedTime: job.postedTime || job.publishedAt || '',
            salary: job.salary || '',
            description: job.description || job.jobDescription || '',
            applicants: job.applicants || job.numberOfApplicants || '',
        }))

        return NextResponse.json({ data: normalizedJobs })
    } catch (e: any) {
        console.error('Jobs Search Error:', e)
        return NextResponse.json({ error: e.message || 'Search failed' }, { status: 500 })
    }
}
