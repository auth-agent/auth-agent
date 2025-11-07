import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

export function CTASection() {
	return (
		<section className="relative z-10 py-12 sm:py-16 md:py-20">
			<Container>
				<div className="mx-auto max-w-4xl text-center">
					<SectionHeading
						title="Ready to Get Started?"
						subtitle="Join thousands of developers using Auth-Agent for secure AI agent authentication"
						subtitleClassName="text-zinc-300 mb-12"
					/>
					<div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-6">
						<Button
							variant="default"
							size="lg"
							className="w-full bg-primary py-6 font-semibold text-base uppercase tracking-tight hover:text-white sm:w-auto sm:py-8 sm:text-lg md:text-xl lg:text-2xl"
						>
							Get Started Now
						</Button>
						<Button
							variant="default"
							size="lg"
							className="w-full py-6 font-semibold text-base tracking-tight hover:border-primary hover:bg-transparent hover:text-primary sm:w-auto sm:py-8 sm:text-lg md:text-xl lg:text-2xl"
						>
							View Documentation
						</Button>
					</div>
					<div className="mt-6 sm:mt-8">
						<p className="text-xs text-zinc-400 sm:text-sm">
							Free tier available • No setup fees • Production-ready
							infrastructure
						</p>
					</div>
				</div>
			</Container>
		</section>
	);
}
