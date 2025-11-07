"use client";

import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import { useEffect, useRef } from "react";
import "@/styles/syntax-theme.css";
import { cn } from "@/lib/utils";

hljs.registerLanguage("python", python);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);

type CodeBlockProps = {
	code: string;
	language?: string;
	className?: string;
};

export function CodeBlock({
	code,
	language = "text",
	className,
}: CodeBlockProps) {
	const codeRef = useRef<HTMLElement>(null);

	useEffect(() => {
		if (codeRef.current) {
			hljs.highlightElement(codeRef.current);
		}
	}, [code, language]);

	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-lg border border-primary/20 bg-black/20 backdrop-blur-sm",
				className,
			)}
		>
			<pre className="m-0 overflow-x-auto bg-transparent p-6">
				<code
					ref={codeRef}
					className={`hljs language-${language} font-mono text-sm leading-relaxed`}
				>
					{code}
				</code>
			</pre>
			{language && (
				<div className="absolute top-2 right-2 rounded bg-primary/20 px-2 py-1 font-medium text-primary text-xs uppercase">
					{language}
				</div>
			)}
		</div>
	);
}
