import Container from "@/components/container";
import { MagicCard } from "@/components/ui/magic-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { LightRays } from "@/components/ui/light-rays";

export function WhatIsSection() {
	return (
		<section className="relative z-10 py-12 sm:py-16 md:py-20">
			<LightRays color="#321808" speed={5} />
			<Container className="relative z-20">
				<SectionHeading
					title="What is Auth-Agent?"
					subtitle={
						<>
							Auth-Agent is a complete{" "}
							<strong className="text-zinc-200">OAuth 2.1 + OIDC</strong>{" "}
							implementation designed for AI agents. It enables AI agents to
							securely authenticate with websites using the Authorization Code
							Flow with PKCE—the same standard used by major platforms like
							Google, GitHub, and Slack.
						</>
					}
				/>

				<div className="mb-8 grid gap-6 px-4 sm:mb-12 sm:gap-8 sm:px-0 md:grid-cols-3">
					<MagicCard
						className="p-6"
						gradientColor="#321808"
						gradientFrom="#f97316"
						gradientTo="#ea580c"
					>
						<h3 className="mb-3 font-semibold text-2xl text-primary tracking-tight">
							OAuth 2.1
						</h3>
						<p className="text-zinc-400 leading-6">
							Latest OAuth specification with mandatory PKCE, enhanced security,
							and simplified flow
						</p>
					</MagicCard>

					<MagicCard
						className="p-6"
						gradientColor="#321808"
						gradientFrom="#f97316"
						gradientTo="#ea580c"
					>
						<h3 className="mb-3 font-semibold text-2xl text-primary tracking-tight">
							OIDC Compliant
						</h3>
						<p className="text-zinc-400 leading-6">
							OpenID Connect with ID tokens, UserInfo endpoint, and discovery
							document
						</p>
					</MagicCard>

					<MagicCard
						className="p-6"
						gradientColor="#321808"
						gradientFrom="#f97316"
						gradientTo="#ea580c"
					>
						<h3 className="mb-3 font-semibold text-2xl text-primary">
							Production-Ready
						</h3>
						<p className="text-zinc-400 leading-6">
							Rate limiting, token refresh, security headers, and comprehensive
							error handling
						</p>
					</MagicCard>
				</div>
			</Container>
		</section>
	);
}
