import { Terminal } from "lucide-react";
import type { FC } from "react";
import { CopyButton } from "@/components/CopyButton";

interface Props {
	command: string;
}

export const TerminalCommand: FC<Props> = ({ command }: Props) => {
	return (
		<div className="relative group flex items-center gap-3 py-2.5 pl-7 pr-2 bg-zinc-900/70 border border-zinc-800/80 rounded-full backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-zinc-900/80 ring-1 ring-transparent hover:ring-emerald-500/20">
			<Terminal className="w-4 h-4 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
			<code className="text-sm md:text-md font-mono text-zinc-50">
				{command}
			</code>
			<CopyButton content={command} />
		</div>
	);
};
