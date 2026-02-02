import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Pricing6Props {
    heading?: string;
    description?: string;
    price?: string | number;
    priceSuffix?: string;
    features?: string[][];
    buttonText?: string;
}

const defaultFeatures = [
    ["Unlimited", "Integrations", "24/7 support"],
    ["Live collaborations", "Unlimited storage", "30-day money back"],
    ["Unlimited members", "Customization", "Unlimited users"],
];

export const Pricing6 = ({
    heading = "Pricing",
    description = "Simple pricing with a free 7 day trial.",
    price = 29,
    priceSuffix = "/mo",
    features = defaultFeatures,
    buttonText = "Start free trial",
}: Pricing6Props) => {
    return (
        <section className="py-12">
            <div className="container px-4">
                <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
                    {/* 
          <h2 className="text-4xl font-semibold text-pretty lg:text-6xl text-gray-900">
            {heading}
          </h2>
          <p className="max-w-md text-gray-500 lg:text-xl">
            {description}
          </p> 
          */}

                    <div className="mx-auto flex w-full flex-col rounded-xl border border-gray-200 bg-white p-8 shadow-sm sm:w-fit sm:min-w-80 hover:shadow-md transition-shadow">
                        <div className="flex justify-center items-baseline mb-2">
                            <span className="text-lg font-semibold text-gray-900">$</span>
                            <span className="text-6xl font-bold text-gray-900 tracking-tighter">{price}</span>
                            <span className="self-end text-gray-500 font-medium ml-1">
                                {priceSuffix}
                            </span>
                        </div>

                        <div className="my-8 text-left">
                            {features.map((featureGroup, idx) => (
                                <div key={idx}>
                                    <ul className="flex flex-col gap-4">
                                        {featureGroup.map((feature, i) => (
                                            <li
                                                key={i}
                                                className="flex items-center justify-between gap-4 text-sm font-medium text-gray-700"
                                            >
                                                {feature} <Check className="inline w-4 h-4 shrink-0 text-black" />
                                            </li>
                                        ))}
                                    </ul>
                                    {idx < features.length - 1 && <Separator className="my-6 bg-gray-100" />}
                                </div>
                            ))}
                        </div>

                        <Button className="w-full bg-gray-900 hover:bg-black text-white h-12 text-base font-semibold rounded-lg shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
                            {buttonText}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};
