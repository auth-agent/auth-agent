import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
	title: string;
	subtitle?: ReactNode;
	className?: string;
	subtitleClassName?: string;
	align?: "left" | "center" | "right";
};

export function SectionHeading({
	title,
	subtitle,
	className,
	subtitleClassName,
	align = "center",
}: SectionHeadingProps) {
	const alignClass =
		align === "center"
			? "text-center"
			: align === "left"
				? "text-left"
				: "text-right";

	return (
		<div className={cn("mb-16", alignClass, className)}>
			<h2
				className={cn(
					"mb-4 bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text font-bold text-4xl text-transparent tracking-tight md:text-5xl",
					alignClass,
				)}
			>
				{title}
			</h2>

			{subtitle && (
				<p
					className={cn(
						"mx-auto max-w-3xl text-xl text-zinc-400 tracking-tight",
						alignClass,
						subtitleClassName,
					)}
				>
					{subtitle}
				</p>
			)}
		</div>
	);
}
