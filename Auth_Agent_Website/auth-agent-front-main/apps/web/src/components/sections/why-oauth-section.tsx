import Container from "@/components/container";
import { MagicCard } from "@/components/ui/magic-card";
import { SectionHeading } from "@/components/ui/section-heading";

export function WhyOAuthSection() {
	return (
		<section className="relative z-10 py-12 sm:py-16 md:py-20">
			<Container>
				<SectionHeading title="Why OAuth 2.1?" />

				<div className="grid gap-6 sm:gap-8 md:grid-cols-3">
					<MagicCard
						className="p-6"
						gradientColor="#321808"
						gradientFrom="#f97316"
						gradientTo="#ea580c"
					>
						<div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
							<svg
								className="size-6 text-primary"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Industry Standard</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-2xl text-primary tracking-tight">
							Industry Standard
						</h3>
						<p className="text-zinc-400 leading-6">
							Same protocol as Google, GitHub, and Microsoft. No proprietary
							implementations.
						</p>
					</MagicCard>

					<MagicCard
						className="p-6"
						gradientColor="#321808"
						gradientFrom="#f97316"
						gradientTo="#ea580c"
					>
						<div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
							<svg
								className="size-6 text-primary"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>PKCE Mandatory</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-2xl text-primary tracking-tight">
							PKCE Mandatory
						</h3>
						<p className="text-zinc-400 leading-6">
							Proof Key for Code Exchange prevents authorization code
							interception attacks.
						</p>
					</MagicCard>

					<MagicCard
						className="p-6"
						gradientColor="#321808"
						gradientFrom="#f97316"
						gradientTo="#ea580c"
					>
						<div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
							<svg
								className="size-6 text-primary"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>OIDC Support</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
						</div>
						<h3 className="mb-3 font-semibold text-2xl text-primary tracking-tight">
							OIDC Support
						</h3>
						<p className="text-zinc-400 leading-6">
							ID tokens with JWT, UserInfo endpoint, and OpenID Connect
							discovery.
						</p>
					</MagicCard>
				</div>
			</Container>
		</section>
	);
}
