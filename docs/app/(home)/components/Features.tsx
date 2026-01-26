"use client";

import { Copy, Palette, Zap } from "lucide-react";
import type { FC } from "react";

const features = [
	{
		title: "Fast, simple integration",
		description:
			"BCH Connect abstracts wallet connection logic so apps can interact out of the box through a single set of hooks.",
		icon: Zap,
	},
	{
		title: "Flexible UI",
		description:
			"Comes with a default modal, the Reown AppKit modal, or the ability to bring your own.",
		icon: Palette,
	},
	{
		title: "Consistency across your dapps",
		description:
			"Avoid reimplementing wallet connection, session, and error handling in every project by using a shared, well-defined integration.",
		icon: Copy,
	},
];

export const Features: FC = () => {
	return (
		<section className="bg-transparent px-6 border-border/40 backdrop-blur-sm">
			<div className="max-w-6xl mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{features.map((feature) => (
						<div
							key={feature.title}
							className="group relative p-8 rounded-2xl bg-card border border-border hover:border-emerald-500/50 transition-colors duration-300"
						>
							<div className="mb-6 inline-flex p-3 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
								<feature.icon className="w-6 h-6" />
							</div>

							<h3 className="text-xl font-semibold text-foreground mb-3">
								{feature.title}
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};
