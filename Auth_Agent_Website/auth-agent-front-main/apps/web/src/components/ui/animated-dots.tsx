"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Dot = {
	id: number;
	left: number;
	top: number;
	delay: number;
};

type AnimatedDotsProps = {
	count?: number;
	className?: string;
};

export function AnimatedDots({ count = 50, className }: AnimatedDotsProps) {
	const [dots, setDots] = useState<Dot[]>([]);

	useEffect(() => {
		const newDots: Dot[] = Array.from({ length: count }, (_, i) => ({
			id: i,
			left: Math.random() * 100,
			top: Math.random() * 100,
			delay: Math.random() * 6,
		}));
		setDots(newDots);
	}, [count]);

	return (
		<div
			className={cn(
				"pointer-events-none fixed inset-0 z-0 overflow-hidden",
				className,
			)}
		>
			{dots.map((dot) => (
				<motion.div
					key={dot.id}
					className="absolute size-1 rounded-full bg-primary"
					style={{
						left: `${dot.left}%`,
						top: `${dot.top}%`,
					}}
					animate={{
						y: [-20, 10, -30, 0],
						x: [10, -15, 5, 0],
						opacity: [0.3, 0.6, 0.4, 0.7, 0.3],
					}}
					transition={{
						duration: dot.id % 2 === 0 ? 8 : dot.id % 3 === 0 ? 10 : 6,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
						delay: dot.delay,
					}}
				/>
			))}
		</div>
	);
}
