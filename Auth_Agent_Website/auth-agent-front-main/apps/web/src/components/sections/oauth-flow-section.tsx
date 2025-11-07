"use client";

import { motion } from "motion/react";
import Container from "@/components/container";
import { LightRays } from "@/components/ui/light-rays";
import { SectionHeading } from "@/components/ui/section-heading";

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.08,
			delayChildren: 0.05,
		},
	},
};

const stepVariants = {
	hidden: { opacity: 0, x: -20 },
	visible: {
		opacity: 1,
		x: 0,
		transition: {
			duration: 0.5,
			ease: [0.22, 1, 0.36, 1],
		},
	},
};

const FlowStep = ({
	number,
	title,
	description,
	participant,
	delay = 0,
}: {
	number: string;
	title: string;
	description: string;
	participant: "agent" | "server" | "website";
	delay?: number;
}) => {
	const colors = {
		agent: "from-violet-500 to-purple-600",
		server: "from-orange-500 to-orange-600",
		website: "from-sky-500 to-blue-600",
	};

	return (
		<motion.div
			variants={stepVariants}
			whileHover={{ scale: 1.02, x: 10 }}
			className="group relative flex items-start gap-4"
		>
			<div
				className={`flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${colors[participant]} font-bold text-lg text-white shadow-lg ring-4 ring-black/50 transition-all group-hover:scale-110 group-hover:shadow-xl`}
			>
				{number}
			</div>
			<div className="flex-1">
				<h4 className="mb-1 font-bold text-lg text-white group-hover:text-primary transition-colors">
					{title}
				</h4>
				<p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
			</div>
		</motion.div>
	);
};

const ParticipantCard = ({
	icon,
	title,
	subtitle,
	tech,
	color,
}: {
	icon: React.ReactNode;
	title: string;
	subtitle: string;
	tech: string;
	color: string;
}) => (
	<motion.div
		variants={stepVariants}
		whileHover={{ scale: 1.05, y: -5 }}
		className="group relative overflow-hidden rounded-2xl border-2 border-white/10 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 p-6 backdrop-blur-md transition-all hover:border-primary/50"
	>
		<div className="relative z-10">
			<div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${color} p-4 shadow-lg`}>
				{icon}
			</div>
			<h3 className="mb-2 font-bold text-2xl text-white">{title}</h3>
			<p className="mb-1 text-sm text-zinc-400">{subtitle}</p>
			<p className="font-semibold text-primary text-xs">{tech}</p>
		</div>
		<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
	</motion.div>
);

export function OAuthFlowSection() {
	return (
		<section className="relative z-10 overflow-hidden py-20 sm:py-28 md:py-36">
			<LightRays
				className="opacity-20"
				count={8}
				color="rgba(251, 146, 60, 0.12)"
				blur={50}
				speed={20}
			/>

			<Container>
				<SectionHeading
					title="Complete OAuth 2.1 Flow"
					subtitle="Powered by Cloudflare Workers + Supabase PostgreSQL"
					subtitleClassName="text-primary font-semibold"
					className="mb-12 sm:mb-16"
				/>

				{/* Participants */}
				<motion.div
					className="mb-16 grid gap-6 sm:grid-cols-3"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-50px" }}
					variants={containerVariants}
				>
					<ParticipantCard
						icon={
							<svg
								className="size-8 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.5"
									d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
						}
						title="AI Agent"
						subtitle="Browser Automation"
						tech="Python + browser-use"
						color="from-violet-500 to-purple-600"
					/>

					<ParticipantCard
						icon={
							<svg
								className="size-8 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.5"
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
						}
						title="Auth Agent"
						subtitle="OAuth 2.1 Server"
						tech="Cloudflare Workers + Hono"
						color="from-orange-500 to-orange-600"
					/>

					<ParticipantCard
						icon={
							<svg
								className="size-8 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.5"
									d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
								/>
							</svg>
						}
						title="Website"
						subtitle="OAuth Client"
						tech="Next.js + React"
						color="from-sky-500 to-blue-600"
					/>
				</motion.div>

				{/* Detailed Flow */}
				<motion.div
					className="relative mx-auto max-w-4xl rounded-2xl border-2 border-white/10 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-8 backdrop-blur-xl sm:p-10 md:p-12"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={containerVariants}
				>
					{/* Decorative corner accents */}
					<div className="absolute top-0 left-0 size-20 rounded-tl-2xl border-primary border-l-4 border-t-4 opacity-50" />
					<div className="absolute right-0 bottom-0 size-20 rounded-br-2xl border-primary border-r-4 border-b-4 opacity-50" />

					<div className="relative z-10 space-y-6">
						{/* Agent Actions */}
						<FlowStep
							number="1"
							title="Agent navigates to website"
							description="AI agent uses browser automation to visit the target website and locate the authentication UI"
							participant="agent"
						/>

						<FlowStep
							number="2"
							title='Agent clicks "Sign in with Auth Agent"'
							description="The orange gradient button triggers the OAuth flow, redirecting to the authorization endpoint"
							participant="agent"
						/>

						<FlowStep
							number="3"
							title="Website generates PKCE challenge"
							description="Client creates code_verifier and SHA-256 code_challenge for secure authorization"
							participant="website"
						/>

						<FlowStep
							number="4"
							title="Redirect to Auth Agent server"
							description="Browser navigates to /authorize with client_id, redirect_uri, code_challenge, and state"
							participant="website"
						/>

						{/* Server Actions */}
						<FlowStep
							number="5"
							title="Server shows spinning authentication page"
							description="Cloudflare Worker serves HTML with window.authRequest containing request_id for agent detection"
							participant="server"
						/>

						<FlowStep
							number="6"
							title="Agent extracts request_id"
							description="Browser automation detects the auth page and reads request_id from JavaScript object"
							participant="agent"
						/>

						<FlowStep
							number="7"
							title="Agent POSTs credentials"
							description="Sends agent_id, agent_secret, model, and request_id to /api/agent/authenticate endpoint"
							participant="agent"
						/>

						<FlowStep
							number="8"
							title="Server verifies credentials"
							description="Cloudflare Worker queries Supabase PostgreSQL and validates agent_secret with PBKDF2 hash"
							participant="server"
						/>

						<FlowStep
							number="9"
							title="Spinning page polls for completion"
							description="Browser continuously checks /api/check-status until authentication is confirmed"
							participant="agent"
						/>

						<FlowStep
							number="10"
							title="Auto-redirect with authorization code"
							description="Page automatically redirects to callback URL with authorization code and state"
							participant="website"
						/>

						{/* Token Exchange */}
						<FlowStep
							number="11"
							title="Website exchanges code for tokens"
							description="Backend sends code, code_verifier, client_id, and client_secret to /token endpoint"
							participant="website"
						/>

						<FlowStep
							number="12"
							title="Server validates PKCE and generates tokens"
							description="Validates code_challenge matches SHA-256(code_verifier), generates JWT access_token and refresh_token"
							participant="server"
						/>

						<FlowStep
							number="13"
							title="Store tokens and create session"
							description="Website stores tokens securely (httpOnly cookies or session storage) and redirects to dashboard"
							participant="website"
						/>

						<FlowStep
							number="14"
							title="Authentication complete!"
							description="AI agent successfully authenticated, access_token can be used for authorized API requests"
							participant="agent"
						/>
					</div>

					{/* Technology Stack Badge */}
					<motion.div
						className="mt-8 flex flex-wrap items-center justify-center gap-3 border-t border-white/10 pt-8"
						variants={stepVariants}
					>
						<span className="text-sm text-zinc-400">Powered by:</span>
						<div className="flex flex-wrap gap-2">
							{[
								"Cloudflare Workers",
								"Supabase PostgreSQL",
								"Hono",
								"jose (JWT)",
								"PBKDF2",
							].map((tech) => (
								<span
									key={tech}
									className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary text-xs ring-1 ring-primary/20"
								>
									{tech}
								</span>
							))}
						</div>
					</motion.div>
				</motion.div>

				{/* Security Features */}
				<motion.div
					className="mt-12 grid gap-6 sm:grid-cols-3"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-50px" }}
					variants={containerVariants}
				>
					{[
						{
							icon: "🔐",
							title: "PKCE Protection",
							description: "SHA-256 challenge prevents authorization code interception",
						},
						{
							icon: "⚡",
							title: "Edge Computing",
							description: "Cloudflare Workers provide global low-latency responses",
						},
						{
							icon: "🗄️",
							title: "PostgreSQL Storage",
							description: "Supabase provides reliable, scalable database with RLS",
						},
					].map((feature) => (
						<motion.div
							key={feature.title}
							variants={stepVariants}
							whileHover={{ scale: 1.05, y: -5 }}
							className="group rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 p-6 text-center backdrop-blur-sm transition-all hover:border-primary/30"
						>
							<div className="mb-3 text-4xl">{feature.icon}</div>
							<h4 className="mb-2 font-bold text-white">{feature.title}</h4>
							<p className="text-sm text-zinc-400 leading-relaxed">
								{feature.description}
							</p>
						</motion.div>
					))}
				</motion.div>
			</Container>
		</section>
	);
}
