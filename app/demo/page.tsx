import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'

export default function DemoPage() {
    const cvData = {
        personalInfo: {
            name: "Alex Jensen",
            location: "San Francisco, CA",
            email: "alex.jensen@example.com",
            phone: "+1 (555) 123-4567"
        },
        experience: [
            {
                title: "Senior Product Designer",
                company: "TechFlow Inc.",
                duration: "Jan 2021 – Present",
                description: "Led the redesign of the core mobile application, resulting in a 40% increase in user retention. Collaborated with cross-functional teams to implement a new design system."
            },
            {
                title: "UX Designer",
                company: "Creative Solutions",
                duration: "Jun 2018 – Dec 2020",
                description: "Designed intuitive user interfaces for enterprise clients. Conducted user research and usability testing to validate design decisions."
            }
        ],
        education: [
            {
                schoolName: "University of California, Berkeley",
                degree: "Bachelor of Arts in Cognitive Science",
                timePeriod: { endDate: { year: "2018" } }
            }
        ],
        skills: ["Figma", "Sketch", "Prototyping", "User Research", "HTML/CSS", "Design Systems"]
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
            {/* Navbar Placeholder */}
            <div className="w-full max-w-5xl mb-8 flex justify-between items-center">
                <Link href="/" className="font-bold text-xl text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg" />
                    CVLink
                </Link>
                <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors">
                    Get Started
                </Link>
            </div>

            <div className="w-full max-w-[210mm] bg-white shadow-xl p-[20mm] text-sm relative overflow-hidden group">

                {/* Marketing overlay */}
                <div className="absolute top-4 right-4 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1 shadow-sm">
                    <CheckCircle className="w-3 h-3" /> ATS Optimized
                </div>

                <h1 className="text-4xl font-bold text-gray-900 uppercase border-b-2 border-black pb-4 mb-6 tracking-tight">
                    {cvData.personalInfo.name}
                </h1>

                <div className="flex justify-between text-gray-600 mb-8 text-xs font-medium uppercase tracking-wider">
                    <span>{cvData.personalInfo.location}</span>
                    <span>{cvData.personalInfo.email}</span>
                    <span>{cvData.personalInfo.phone}</span>
                </div>

                <section className="mb-8">
                    <h3 className="font-bold text-lg text-gray-900 border-b border-gray-200 mb-4 pb-1 uppercase tracking-wider flex items-center gap-2">
                        Experience
                    </h3>
                    <div className="space-y-6">
                        {cvData.experience.map((exp: any, i: number) => (
                            <div key={i}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold text-gray-900 text-base">{exp.title}</h4>
                                    <span className="text-gray-500 text-xs font-medium">{exp.duration}</span>
                                </div>
                                <div className="text-gray-700 font-medium text-sm mb-2 italic">{exp.company}</div>
                                <p className="text-gray-700 leading-relaxed text-sm">
                                    {exp.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className="font-bold text-lg text-gray-900 border-b border-gray-200 mb-4 pb-1 uppercase tracking-wider">Education</h3>
                    <div className="space-y-4">
                        {cvData.education.map((edu: any, i: number) => (
                            <div key={i}>
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-bold text-gray-900">{edu.schoolName}</h4>
                                    <span className="text-gray-500 text-xs">{edu.timePeriod.endDate.year}</span>
                                </div>
                                <div className="text-gray-600">
                                    {edu.degree}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="font-bold text-lg text-gray-900 border-b border-gray-200 mb-4 pb-1 uppercase tracking-wider">Skills</h3>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                        {cvData.skills.join(' • ')}
                    </div>
                </section>
            </div>

            <div className="mt-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Want a resume like this?</h2>
                <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                >
                    Create Yours for Free <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
            </div>
        </div>
    )
}
