import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { FC, ReactNode } from "react";

interface Props {
	href: string;
	children: ReactNode;
}

export const CtaButton: FC<Props> = ({ href, children }: Props) => {
	return (
		<Link
			href={href}
			className="group flex items-center justify-center py-3 px-10 text-md md:text-lg font-semibold text-background transition-transform bg-foreground rounded-full hover:scale-105 active:scale-95"
		>
			{children}
			<ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
		</Link>
	);
};
