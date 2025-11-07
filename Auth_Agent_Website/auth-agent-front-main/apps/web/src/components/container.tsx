import { cn } from "@/lib/utils";

type ContainerProps = {
	children: React.ReactNode;
	className?: string;
};

export default function Container({ ...props }: ContainerProps) {
	return (
		<div
			className={cn(
				"mx-auto flex w-full px-2 sm:max-w-7xl sm:px-0",
				props.className,
			)}
		>
			<div className="flex w-full flex-col items-center gap-6">
				{props.children}
			</div>
		</div>
	);
}
