import { NextResponse } from 'next/server'
import { scrapeLinkedInProfile } from '@/lib/apify'

export async function POST(request: Request) {
    try {
        const { profileUrl } = await request.json()

        if (!profileUrl) {
            return NextResponse.json({ error: 'Profile URL required' }, { status: 400 })
        }

        // Scrape LinkedIn profile
        // Note: This operation can take 10-20 seconds. 
        // In a production app, we should use a queue. 
        // For MVP, we await it (Vercel timeout is 10s on free tier, usually we need Pro for this).
        // If it fails on Vercel free tier, we might need a workaround, but for local it's fine.
        const profileData = await scrapeLinkedInProfile(profileUrl)

        if (!profileData) {
            return NextResponse.json({ error: 'Failed to scrape profile' }, { status: 500 })
        }

        // Normalize data
        const normalizedData = {
            personalInfo: {
                name: profileData.fullName,
                headline: profileData.headline,
                location: profileData.location,
                email: profileData.email || '',
                phone: profileData.phone || '',
                linkedinUrl: profileData.publicIdentifier ? `https://linkedin.com/in/${profileData.publicIdentifier}` : profileUrl
            },
            about: profileData.about || profileData.summary,
            experience: profileData.experience || [],
            education: profileData.education || [],
            skills: profileData.skills || [],
            certifications: profileData.certifications || [],
        }

        return NextResponse.json({ data: normalizedData })
    } catch (error: any) {
        console.error('LinkedIn scrape error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
