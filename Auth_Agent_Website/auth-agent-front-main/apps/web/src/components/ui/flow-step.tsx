import { cn } from "@/lib/utils";

type FlowStepProps = {
	title: string;
	subtitle: string;
	icon: React.ReactNode;
	steps: string[];
	className?: string;
};

export function FlowStep({
	title,
	subtitle,
	icon,
	steps,
	className,
}: FlowStepProps) {
	return (
		<div className={cn("text-center", className)}>
			<div className="mb-4 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary to-orange-600 p-6 shadow-lg">
				<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border border-primary/30 bg-black">
					{icon}
				</div>
				<h3 className="font-bold text-lg text-white">{title}</h3>
				<p className="text-orange-100 text-sm">{subtitle}</p>
			</div>

			<div className="space-y-2">
				{steps.map((step) => (
					<div
						key={step}
						className="rounded-lg border border-primary/20 bg-black/50 p-3 text-sm text-zinc-300"
					>
						{step}
					</div>
				))}
			</div>
		</div>
	);
}
