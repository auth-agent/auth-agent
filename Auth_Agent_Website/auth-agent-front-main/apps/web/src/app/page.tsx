"use client";

import { CTASection } from "@/components/sections/cta-section";
import { ForAIAgentsSection } from "@/components/sections/for-ai-agents-section";
import { ForWebsitesSection } from "@/components/sections/for-websites-section";
import { HeroSection } from "@/components/sections/hero-section";
import { WhatIsSection } from "@/components/sections/what-is-section";
import { WhyOAuthSection } from "@/components/sections/why-oauth-section";
import { LightRays } from "@/components/ui/light-rays";

export default function Page() {
	return (
		<div className="relative w-full">
			{/* Global orange animated background */}
			<div className="fixed inset-0 z-0">
				<LightRays
					className="opacity-40"
					count={12}
					color="rgba(251, 146, 60, 0.15)"
					blur={60}
					speed={8}
				/>
			</div>

			{/* Content with higher z-index */}
			<div className="relative z-10">
				<HeroSection />

				<div className="flex flex-col gap-8 sm:gap-12 md:gap-16">
					<WhatIsSection />
					<ForAIAgentsSection />
					<ForWebsitesSection />
					<WhyOAuthSection />
					<CTASection />
				</div>
			</div>
		</div>
	);
}
