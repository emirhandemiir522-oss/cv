import { NextResponse } from 'next/server'
import PDFParser from 'pdf2json'

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const parser = new PDFParser(null, true)

        return new Promise<NextResponse>((resolve, reject) => {
            parser.on('pdfParser_dataError', (errData: any) => {
                console.error('PDF Parse Error:', errData.parserError)
                resolve(NextResponse.json({ error: 'Failed to parse PDF file' }, { status: 500 }))
            })

            parser.on('pdfParser_dataReady', (pdfData: any) => {
                const text = parser.getRawTextContent()
                resolve(NextResponse.json({ text }))
            })

            parser.parseBuffer(buffer)
        })

    } catch (error: any) {
        console.error('PDF Parse Error:', error)
        return NextResponse.json({ error: 'Failed to parse PDF file' }, { status: 500 })
    }
}
