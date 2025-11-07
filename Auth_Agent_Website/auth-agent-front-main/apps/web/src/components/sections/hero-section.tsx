import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { LightRays } from "@/components/ui/light-rays";
import { TypingAnimation } from "@/components/ui/typing-animation";

export function HeroSection() {
	return (
		<section className="relative flex min-h-screen w-full flex-col items-center justify-center gap-6">
			<Container className="z-20 py-24 sm:py-32 md:py-48">
				<div className="flex flex-col items-center gap-6 sm:gap-8">
					<h1 className="max-w-5xl text-center font-bold text-6xl text-white leading-16 tracking-tight sm:text-5xl sm:leading-16 md:text-6xl lg:text-7xl">
						OAuth 2.1 Authentication <br /> for{" "}
						<TypingAnimation
							className="text-primary tracking-tight"
							words={[
								"AI Agents",
								"ChatGPT",
								"Claude",
								"Gemini",
								"LLaMA",
								"GPT-4",
								"Copilot",
								"AI Agents",
							]}
						/>
						.
					</h1>

					<div className="flex max-w-4xl flex-col items-center">
						<p className="text-center font-semibold text-xl text-zinc-200 tracking-tight sm:text-lg sm:leading-relaxed md:text-xl lg:text-2xl">
							Industry-standard authentication protocol for AI agents and
							websites.
						</p>

						<p className="text-center font-normal text-lg text-zinc-400 tracking-tight sm:text-base sm:leading-relaxed md:text-lg">
							The same OAuth flow used by Google, GitHub, and Microsoft—now
							optimized for AI agents.
						</p>
					</div>

					<div className="flex flex-col items-center gap-4">
						<div className="mt-4 flex w-full max-w-2xl flex-col items-center gap-3 sm:flex-row sm:gap-4">
							<Button
								variant="default"
								size="lg"
								className="w-full bg-primary py-6 font-semibold text-xl uppercase tracking-tight hover:text-white sm:w-auto sm:py-8 sm:text-lg md:text-xl lg:text-2xl"
							>
								Get started for free
							</Button>

							<Button
								variant="default"
								size="lg"
								className="w-full py-6 font-semibold text-xl uppercase tracking-tight hover:border-primary hover:bg-transparent hover:text-primary sm:w-auto sm:py-8 sm:text-lg md:text-xl lg:text-2xl"
							>
								View Documentation
							</Button>
						</div>

						<p className="text-center text-sm text-zinc-300 uppercase sm:text-sm">
							No credit card required • Production-ready OAuth 2.1 + OIDC
						</p>
					</div>
				</div>
			</Container>

			<LightRays color="#321808" speed={7} />
		</section>
	);
}
