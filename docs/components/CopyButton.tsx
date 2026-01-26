"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface Props {
	content: string;
}

export const CopyButton = ({ content }: Props) => {
	const [copied, setCopied] = useState<boolean>();
	const handleCopy = () => {
		navigator.clipboard.writeText(content);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
			aria-label="Copy command"
		>
			{copied ? (
				<Check className="w-4 h-4 text-emerald-500" />
			) : (
				<Copy className="w-4 h-4" />
			)}
		</button>
	);
};
