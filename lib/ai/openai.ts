import OpenAI from 'openai'

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not defined')
  }
  return new OpenAI({ apiKey })
}

export async function generateResume(inputData: any) {
  const openai = getOpenAIClient()
  const prompt = `You are a professional ATS resume writer.
Convert this profile data (extracted from LinkedIn or a resume file) into a clean, ATS-friendly resume with quantified impact bullets.

Input Data:
${typeof inputData === 'string' ? inputData : JSON.stringify(inputData, null, 2)}

Output a JSON object with this exact structure:
{
  "personalInfo": {
    "name": "string",
    "headline": "string",
    "location": "string",
    "email": "string",
    "phone": "string"
  },
  "summary": "string (2-3 sentences)",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "duration": "string",
      "bullets": ["string", "string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "year": "string"
    }
  ],
  "skills": ["string", "string"],
  "certifications": ["string"]
}

Important:
- Use action verbs (Led, Built, Increased)
- Quantify achievements with numbers
- Keep bullets concise (1-2 lines max)
- ATS-friendly format only`

  const completion = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  return JSON.parse(completion.choices[0].message.content!)
}

export async function optimizeResumeForJob(resumeData: any, jobData: any) {
  const openai = getOpenAIClient()
  const prompt = `Job Posting:
${JSON.stringify(jobData, null, 2)}

Current Resume:
${JSON.stringify(resumeData, null, 2)}

Task:
1. Identify key requirements and keywords from job posting
2. Rewrite experience bullets to match job requirements naturally
3. Add missing skills that user likely has based on their experience
4. Quantify achievements where possible
5. Calculate ATS match score (0-100) based on keyword match

Output JSON:
{
  "optimizedResume": { ... same structure as input resume ... },
  "atsScore": 85,
  "matchedKeywords": ["python", "react"],
  "missingKeywords": ["kubernetes"],
  "recommendations": ["string"]
}`

  const completion = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  return JSON.parse(completion.choices[0].message.content!)
}
