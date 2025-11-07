import { cva, type VariantProps } from "class-variance-authority";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { Slot as SlotPrimitive } from "radix-ui";
import type React from "react";
import { type ComponentProps, useCallback, useEffect } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-medium text-sm outline-none transition-colors duration-75 ease-linear focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"border border-primary/40 bg-transparent text-white hover:bg-primary/20",
				destructive:
					"border border-destructive/40 bg-transparent text-white hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
				outline:
					"border border-border/40 bg-transparent text-foreground hover:bg-accent/20",
				secondary:
					"border border-secondary/40 bg-transparent text-white hover:bg-secondary/20",
				ghost:
					"border border-transparent bg-transparent text-foreground hover:bg-accent/20",
				link: "bg-transparent text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-10 px-6 has-[>svg]:px-4",
				icon: "size-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	children,
	...props
}: ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const gradientSize = 150;
	const mouseX = useMotionValue(-gradientSize);
	const mouseY = useMotionValue(-gradientSize);

	const reset = useCallback(() => {
		mouseX.set(-gradientSize);
		mouseY.set(-gradientSize);
	}, [mouseX, mouseY]);

	const handlePointerMove = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			const rect = e.currentTarget.getBoundingClientRect();
			mouseX.set(e.clientX - rect.left);
			mouseY.set(e.clientY - rect.top);
		},
		[mouseX, mouseY],
	);

	useEffect(() => {
		reset();
	}, [reset]);

	if (asChild) {
		return (
			<SlotPrimitive.Slot
				data-slot="button"
				className={cn(buttonVariants({ variant, size, className }))}
				{...props}
			>
				{children}
			</SlotPrimitive.Slot>
		);
	}

	return (
		<div
			className="group relative inline-flex"
			onPointerMove={handlePointerMove}
			onPointerLeave={reset}
			onPointerEnter={reset}
		>
			<motion.div
				className="pointer-events-none absolute inset-0 bg-border opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				style={{
					background: useMotionTemplate`
						radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
						#ff8800,
						#ffaa00,
						var(--border) 100%
						)
					`,
				}}
			/>
			<div className="absolute inset-px bg-background" />
			<button
				data-slot="button"
				className={cn(buttonVariants({ variant, size }), "relative", className)}
				{...props}
			>
				{children}
			</button>
		</div>
	);
}

export { Button, buttonVariants };
