"use client";

import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<>
			{children}
			<Toaster richColors />
		</>
	);
}
