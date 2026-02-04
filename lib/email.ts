import { Resend } from 'resend'

export async function sendWelcomeEmail(email: string) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // Can only verify this on Resend dashboard with custom domain, but default works for testing
      to: email,
      subject: 'Welcome to CVLink! 🚀',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563EB;">Welcome to CVLink!</h1>
          <p>We're excited to help you land your dream job.</p>
          <p>With your 7-day free trial, you can:</p>
          <ul>
            <li>Import your LinkedIn profile instantly</li>
            <li>Generate professional, ATS-optimized resumes</li>
            <li>Tailor your CV for specific job postings using AI</li>
          </ul>
          <p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Go to Dashboard
            </a>
          </p>
          <p>Best regards,<br>The CVLink Team</p>
        </div>
      `
    })
    return { success: true, data }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}
