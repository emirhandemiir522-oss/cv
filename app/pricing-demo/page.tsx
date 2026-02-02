"use client"

import { PricingCard } from "@/components/ui/pricing-card"

export default function PricingDemoPage() {
    const basicPlan = {
        heading: "Basic Plan",
        description: "Perfect for starters",
        price: 29,
        buttonText: "Get Started",
        list: [
            "Up to 5 projects",
            "Basic analytics",
            "24/7 support",
        ],
    }

    const proPlan = {
        heading: "Pro Plan",
        description: "For growing businesses",
        price: 99,
        discount: 20,
        buttonText: "Upgrade Now",
        listHeading: "Everything in Basic, plus:",
        list: [
            "Unlimited projects",
            "Advanced analytics",
            "Priority support",
            "Custom integrations",
        ],
    }

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 flex flex-col items-center justify-center space-y-8">
            <h1 className="text-3xl font-bold text-white mb-8">Pricing Components Demo</h1>

            <div className="flex flex-wrap justify-center gap-8">
                <div className="space-y-4">
                    <h2 className="text-xl text-white text-center">Default Variant</h2>
                    <PricingCard {...basicPlan} />
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl text-white text-center">Outline Variant (With Discount)</h2>
                    <PricingCard {...proPlan} variant="outline" />
                </div>
            </div>
        </div>
    )
}
