import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import puppeteer from 'puppeteer'

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Get Resume Data
        const { data: resume } = await supabase
            .from('resumes')
            .select('*')
            .eq('id', params.id)
            .single()

        if (!resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
        }

        // 2. Launch Puppeteer
        // Note: For Vercel deployment, you need `puppeteer-core` and `@sparticuz/chromium`
        // For local development, standard `puppeteer` works fine.
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
        const page = await browser.newPage()

        // 3. Navigate to Public Resume URL
        // We use the public URL so the PDF looks exactly like the web view
        // Need to ensure the app is running locally for this API to hit localhost
        // In production, this would be the actual domain
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const publicUrl = `${appUrl}/r/${resume.public_slug}`

        await page.goto(publicUrl, { waitUntil: 'networkidle0' })

        // 4. Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        })

        await browser.close()

        // 5. Upload to Supabase Storage
        const fileName = `${user.id}/${resume.id}-${Date.now()}.pdf`
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('resumes') // Ensure this bucket exists
            .upload(fileName, pdfBuffer, {
                contentType: 'application/pdf',
                upsert: true
            })

        if (uploadError) {
            console.error('Upload Error:', uploadError)
            throw new Error('Failed to upload PDF')
        }

        // 6. Get Public URL
        const { data: { publicUrl: signedUrl } } = supabase
            .storage
            .from('resumes')
            .getPublicUrl(fileName)

        // 7. Update Resume Record
        await supabase
            .from('resumes')
            .update({ pdf_url: signedUrl })
            .eq('id', params.id)

        return NextResponse.json({ url: signedUrl })

    } catch (error) {
        console.error('PDF Generation Error:', error)
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
    }
}
