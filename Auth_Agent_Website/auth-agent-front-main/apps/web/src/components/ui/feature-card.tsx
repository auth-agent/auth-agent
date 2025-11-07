import { cn } from "@/lib/utils";

type FeatureCardProps = {
	title: string;
	description: string;
	icon?: React.ReactNode;
	className?: string;
};

export function FeatureCard({
	title,
	description,
	icon,
	className,
}: FeatureCardProps) {
	return (
		<div
			className={cn(
				"rounded-lg border border-primary/20 bg-gray-800/50 p-6 backdrop-blur-sm transition-colors duration-75 ease-linear hover:border-primary/40",
				className,
			)}
		>
			{icon && (
				<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary text-black">
					{icon}
				</div>
			)}
			<h3 className="mb-3 font-semibold text-2xl text-primary">{title}</h3>
			<p className="text-zinc-300">{description}</p>
		</div>
	);
}
