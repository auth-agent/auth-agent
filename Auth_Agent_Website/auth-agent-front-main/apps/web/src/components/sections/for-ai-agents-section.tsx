"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Container from "@/components/container";
import { CodeBlock } from "@/components/ui/code-block";
import { SectionHeading } from "@/components/ui/section-heading";
import { useMediaQuery } from "@/hooks/use-media-query";

export function ForAIAgentsSection() {
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
					title="For AI Agents"
					subtitle="Authenticate with any website using our Python SDK"
					subtitleClassName="text-zinc-300"
				/>

				<div
					ref={containerRef}
					className="grid items-start gap-8 md:grid-cols-2 md:gap-12"
				>
					<motion.div
						ref={textRef}
						style={isDesktop ? { y: textY } : {}}
						className="order-2 px-6 sm:px-0 md:order-1"
					>
						<h3 className="mb-4 font-semibold text-primary text-xl sm:text-2xl">
							AI Agent Authentication with Browser-Use
						</h3>
						<p className="mb-6 text-sm text-zinc-300 sm:text-base">
							Enable your AI agents to authenticate on any website using our Auth Agent tools.
							The example shows a complete browser-use integration where an AI agent navigates
							to a website, clicks the "Sign in with Auth Agent" button, and completes the
							OAuth flow automatically.
						</p>
						<ul className="space-y-2 text-sm text-zinc-300 sm:text-base">
							<li className="flex items-center">
								<span className="mr-3 size-2 flex-shrink-0 rounded-full bg-primary" />
								Programmatic authentication flow
							</li>
							<li className="flex items-center">
								<span className="mr-3 size-2 flex-shrink-0 rounded-full bg-primary" />
								Browser automation with browser-use
							</li>
							<li className="flex items-center">
								<span className="mr-3 size-2 flex-shrink-0 rounded-full bg-primary" />
								Secure credential verification (PBKDF2)
							</li>
							<li className="flex items-center">
								<span className="mr-3 size-2 flex-shrink-0 rounded-full bg-primary" />
								Auto-redirect after authentication
							</li>
						</ul>
					</motion.div>

					<div
						ref={codeRef}
						className="order-1 px-2 sm:px-0 md:sticky md:top-24 md:order-2"
					>
						<CodeBlock
							language="python"
							code={`"""
Example: Auth Agent authentication with browser-use
"""
import os
import asyncio
from dotenv import load_dotenv
from auth_agent_authenticate import AuthAgentTools
from browser_use import Agent, ChatBrowserUse

load_dotenv()

async def main():
    # Initialize LLM
    llm = ChatBrowserUse()

    # Initialize Auth Agent tools with credentials
    tools = AuthAgentTools(
        agent_id=os.getenv('AGENT_ID'),
        agent_secret=os.getenv('AGENT_SECRET'),
        model=os.getenv('AGENT_MODEL', 'browser-use'),
    )

    # Create the authentication task
    task = (
        "Go to the website and click 'Sign in with Auth Agent'. "
        "When the spinning authentication page appears, "
        "use the authenticate_with_auth_agent tool to complete "
        "the authentication. Wait for redirect to dashboard."
    )

    # Create and run the agent
    agent = Agent(task=task, llm=llm, tools=tools)
    history = await agent.run()

    print("Authentication Complete!")
    return history

if __name__ == "__main__":
    asyncio.run(main())`}
						/>
					</div>
				</div>
			</Container>
		</section>
	);
}
