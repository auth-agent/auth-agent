"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Container from "@/components/container";
import { CodeBlock } from "@/components/ui/code-block";
import { SectionHeading } from "@/components/ui/section-heading";
import { useMediaQuery } from "@/hooks/use-media-query";

export function ForWebsitesSection() {
	const sectionRef = useRef<HTMLElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const codeRef = useRef<HTMLDivElement>(null);
	const textRef = useRef<HTMLDivElement>(null);
	const [scrollRange, setScrollRange] = useState([0, 0]);
	const isDesktop = useMediaQuery("(min-width: 768px)");

	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start start", "end end"],
	});

	useEffect(() => {
		const updateScrollRange = () => {
			if (
				isDesktop &&
				codeRef.current &&
				textRef.current &&
				containerRef.current
			) {
				const codeHeight = codeRef.current.offsetHeight;
				const textHeight = textRef.current.offsetHeight;
				const maxScroll = Math.max(0, codeHeight - textHeight);
				setScrollRange([0, maxScroll]);

				containerRef.current.style.minHeight = `${Math.max(
					codeHeight,
					textHeight,
				)}px`;
			} else if (containerRef.current) {
				containerRef.current.style.minHeight = "auto";
			}
		};

		updateScrollRange();
		window.addEventListener("resize", updateScrollRange);
		return () => window.removeEventListener("resize", updateScrollRange);
	}, [isDesktop]);

	const textY = useTransform(
		scrollYProgress,
		[0, 1],
		scrollRange as [number, number],
	);

	return (
		<section
			ref={sectionRef}
			className="relative z-10 py-12 sm:py-16 md:py-20"
		>
			<Container>
				<SectionHeading
					title="For Websites"
					subtitle='Add "Login with AI Agent" using standard OAuth 2.1'
					subtitleClassName="text-zinc-300"
				/>

				<div
					ref={containerRef}
					className="grid items-start gap-8 md:grid-cols-2 md:gap-12"
				>
					<div ref={codeRef} className="space-y-8 md:sticky md:top-24">
						{/* Visual Button Preview */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							className="rounded-2xl border-2 border-white/10 bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 p-8 backdrop-blur-xl"
						>
							<p className="mb-6 text-center text-sm text-zinc-400">
								The Auth Agent button as it appears on your website:
							</p>
							<div className="flex justify-center">
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="group relative flex items-center gap-3 overflow-hidden rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-semibold text-lg text-white shadow-xl shadow-orange-500/30 transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-2xl hover:shadow-orange-500/40"
								>
									<div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
									<img
										src="/assets/logo.png"
										alt="Auth Agent"
										className="relative z-10 size-6"
									/>
									<span className="relative z-10">Sign in with Auth Agent</span>
								</motion.button>
							</div>
							<p className="mt-6 text-center text-xs text-zinc-500">
								Click to see hover effect
							</p>
						</motion.div>

						{/* Code Example */}
						<CodeBlock
							language="typescript"
							code={`// Add the Auth Agent button to your website

export function AuthAgentButton() {
  const handleAuthAgentSignIn = async () => {
    // Generate PKCE challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    sessionStorage.setItem('code_verifier', codeVerifier);

    // Redirect to Auth Agent authorization
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID!,
      redirect_uri: \`\${window.location.origin}/callback\`,
      response_type: 'code',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: crypto.randomUUID(),
    });

    window.location.href =
      \`https://api.auth-agent.com/authorize?\${params}\`;
  };

  return (
    <button
      onClick={handleAuthAgentSignIn}
      className="flex items-center gap-3 rounded-lg
                 bg-gradient-to-r from-orange-500 to-orange-600
                 px-6 py-3 text-white shadow-xl
                 hover:from-orange-600 hover:to-orange-700"
    >
      <img src="/logo.png" alt="Auth Agent" className="h-6 w-6" />
      <span>Sign in with Auth Agent</span>
    </button>
  );
}`}
						/>
					</div>

					<motion.div
						ref={textRef}
						style={isDesktop ? { y: textY } : {}}
						className="px-6 sm:px-0"
					>
						<h3 className="mb-4 font-semibold text-primary text-xl sm:text-2xl">
							Add AI Agent Login to Your Website
						</h3>
						<p className="mb-6 text-sm text-zinc-300 sm:text-base">
							Add a "Sign in with Auth Agent" button to your website just like you would
							add Google or GitHub sign-in. Our button uses the same OAuth 2.1 Authorization
							Code Flow with PKCE. Features our signature orange gradient design with the
							Auth Agent logo.
						</p>
						<ul className="space-y-2 text-sm text-zinc-300 sm:text-base">
							<li className="flex items-center">
								<span className="mr-3 size-2 shrink-0 rounded-full bg-primary" />
								Orange gradient button with logo
							</li>
							<li className="flex items-center">
								<span className="mr-3 size-2 shrink-0 rounded-full bg-primary" />
								OAuth 2.1 with PKCE security
							</li>
							<li className="flex items-center">
								<span className="mr-3 size-2 shrink-0 rounded-full bg-primary" />
								JWT tokens with agent identity
							</li>
							<li className="flex items-center">
								<span className="mr-3 size-2 shrink-0 rounded-full bg-primary" />
								Automatic token refresh
							</li>
						</ul>
					</motion.div>
				</div>
			</Container>
		</section>
	);
}
