import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import ResponsiveHeroBanner from '@/components/responsive-hero-banner'
import { Pricing6 } from '@/components/ui/pricing-6'
import { FileText, Sparkles, Zap, ShieldCheck, Share2, Award, Briefcase } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <ResponsiveHeroBanner
        title="Craft Your Career Story"
        titleLine2="with AI-Powered Precision"
        description="Stop struggling with formatting. Let our intelligent resume builder create a polished, ATS-friendly CV that gets you hired at top companies."
        badgeLabel="v2.0"
        badgeText="Now with AI Presentation Builder"
        primaryButtonText="Start Free Trial"
        primaryButtonHref="/dashboard"
        backgroundImageUrl="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=3540&auto=format&fit=crop"
        navLinks={[
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
          { label: "Testimonials", href: "#testimonials" },
          { label: "Sign In", href: "/login" }
        ]}
        logoUrl="https://via.placeholder.com/100x40?text=CVLink"
        partnersTitle="Trusted by forward-thinking professionals from"
        partners={[
          { logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png", href: "#" },
          { logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2560px-IBM_logo.svg.png", href: "#" },
          { logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/2560px-Microsoft_logo_%282012%29.svg.png", href: "#" },
          { logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg", href: "#" },
          { logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png", href: "#" }
        ]}
      />

      {/* Features Section - Bento Grid */}
      <section id="features" className="py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center mb-20 px-4">
          <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">Features</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mt-6 mb-6">
            Everything you need to stand out
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            From smart content suggestions to beautiful templates, we give you the unfair advantage in your job search.
          </p>
        </div>
        <BentoGrid className="max-w-7xl mx-auto px-4">
          {features.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
              className={i === 3 || i === 6 ? "md:col-span-2" : ""}
            />
          ))}
        </BentoGrid>
      </section>

      {/* Testimonials - Infinite Marquee */}
      <section id="testimonials" className="py-24 overflow-hidden bg-white border-t border-gray-100">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by 10,000+ Job Seekers
          </h2>
          <p className="text-gray-500">See what our users have to say about their success stories.</p>
        </div>
        <div className="rounded-md flex flex-col antialiased items-center justify-center relative overflow-hidden">
          <InfiniteMovingCards
            items={testimonials}
            direction="right"
            speed="slow"
          />
        </div>
      </section>

      <section id="pricing" className="bg-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-400 font-semibold tracking-wide uppercase text-sm">Pricing</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-6">Simple, Transparent Pricing</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">One plan, everything included. No hidden fees or upsells.</p>
          </div>
          <Pricing6
            heading=""
            description=""
            price={70}
            priceSuffix="/year"
            features={[
              ["Unlimited AI Optimizations", "PDF Exports", "Public Sharing Links"],
              ["ATS Score Analysis", "Cover Letter Generator", "Priority Support"],
              ["7-Day Free Trial", "Cancel Anytime", "Secure Payment"]
            ]}
            buttonText="Upgrade Now"
          />
        </div>
      </section>

      <footer className="bg-black py-20 text-center text-gray-400 text-sm border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-black font-bold">C</div>
            <span className="text-white text-lg font-bold">CVLink</span>
          </div>
          <p>© 2024 CVLink. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </main>
  )
}

const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>
);

const features = [
  {
    title: "AI Analysis",
    description: "Get instant feedback on your resume's strengths and weaknesses based on the job description.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-blue-50 flex items-center justify-center"><Sparkles className="w-10 h-10 text-blue-500" /></div>,
    icon: <Sparkles className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "ATS Optimization",
    description: "Ensure your resume passes Applicant Tracking Systems with our smart keyword optimization.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-green-50 flex items-center justify-center"><ShieldCheck className="w-10 h-10 text-green-500" /></div>,
    icon: <FileText className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Instant Cover Letters",
    description: "Generate tailored cover letters for every application in seconds.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-purple-50 flex items-center justify-center"><Zap className="w-10 h-10 text-purple-500" /></div>,
    icon: <FileText className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Public Share Links",
    description: "Share your resume with a secure, expiring link. Track views and impress recruiters.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-orange-50 flex items-center justify-center"><Share2 className="w-10 h-10 text-orange-500" /></div>,
    icon: <Share2 className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Smart Formatting",
    description: "Automatically format your experience and skills to match industry standards.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-pink-50 flex items-center justify-center"><Briefcase className="w-10 h-10 text-pink-500" /></div>,
    icon: <Briefcase className="h-4 w-4 text-neutral-500" />,
  },
];

const testimonials = [
  {
    quote:
      "I applied to 50 jobs with my old resume and got 0 callbacks. With CVLink, I got 3 interviews in the first week!",
    name: "Alex Thompson",
    title: "Software Engineer",
  },
  {
    quote:
      "The AI cover letter generator is a lifesaver. It writes better than I do and saves me hours every day.",
    name: "Sarah Chen",
    title: "Product Manager",
  },
  {
    quote: "I was skeptical at first, but the ATS score analysis helped me find keywords I was missing completely.",
    name: "Michael Rodriguez",
    title: "Marketing Director",
  },
  {
    quote:
      "The design is beautiful and the shareable link feature made sending my CV to recruiters so much more professional.",
    name: "Emily Watson",
    title: "UX Designer",
  },
  {
    quote:
      "Worth every penny. I landed my dream job at a top tech company thanks to the optimization suggestions.",
    name: "David Kim",
    title: "Data Scientist",
  },
];
