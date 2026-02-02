import { NextResponse } from 'next/server'
import pdf from 'pdf-parse'

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const data = await pdf(buffer)

        return NextResponse.json({ text: data.text })
    } catch (error: any) {
        console.error('PDF Parse Error:', error)
        return NextResponse.json({ error: 'Failed to parse PDF file' }, { status: 500 })
    }
}
