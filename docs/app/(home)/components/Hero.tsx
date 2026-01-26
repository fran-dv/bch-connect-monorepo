"use client";

import { useTheme } from "next-themes";
import { type FC, useEffect, useState } from "react";
import { CtaButton } from "./CtaButton";
import { Features } from "./Features";
import FloatingLines from "./FloatingLines";
import { TerminalCommand } from "./TerminalCommand";

export const Hero: FC = () => {
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const darkGradient = ["#022c22", "#059669", "#10B981", "#3B82F6", "#172554"];
	const lightGradient = ["#dcfce7", "#10b981", "#059669", "#2563eb", "#1e40af"];
	const isLight = mounted && resolvedTheme === "light";

	return (
		<section className="w-full h-[calc(100dvh-56px)] flex flex-col justify-between align-middle pb-14 bg-background">
			<div className="flex-1 flex flex-col items-center justify-center relative px-3">
				<div className="absolute inset-0 hidden md:block">
					<FloatingLines
						linesGradient={isLight ? lightGradient : darkGradient}
						enabledWaves={["top", "bottom"]}
						lineDistance={[8, 0, 3]}
						mixBlendMode={isLight ? "multiply" : "screen"}
						interactive={false}
					/>
				</div>

				<div className="absolute bottom-0 left-0 right-0 h-[25%] bg-linear-to-t from-background via-background/80 to-transparent z-10 pointer-events-none" />
				<div className="relative z-20 flex flex-col items-center max-w-4xl mx-auto text-center px-0 py-16 lg:py-24 md:py-4 lg:px-0">
					<h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-2 md:mb-6 leading-[1.1]">
						The wallet connection <br className="hidden md:block" />
						<span className="text-transparent bg-clip-text bg-linear-to-br from-foreground via-foreground/80 to-muted-foreground">
							interface for{" "}
							<span className="text-emerald-500">Bitcoin Cash</span> Dapps
						</span>
					</h1>

					<h2 className="max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
						Integrate wallet connectivity into your project in under a minute.
					</h2>

					<div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-4 w-full justify-center mt-8">
						<CtaButton href="/docs/react">Get Started</CtaButton>
						<TerminalCommand command="npm create bch-dapp@latest" />
					</div>
				</div>
			</div>

			<Features />
		</section>
	);
};
