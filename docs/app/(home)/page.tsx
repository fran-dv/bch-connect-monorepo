import { Hero } from "./components/Hero";

export default function HomePage() {
	return (
		<div className="bg-background flex flex-col text-foreground selection:bg-emerald-500/30">
			<Hero />
		</div>
	);
}
