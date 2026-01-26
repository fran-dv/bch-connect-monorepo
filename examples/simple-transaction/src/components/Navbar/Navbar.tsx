import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { ConnectButton } from "@/components/ConnectButton";

export const Navbar: React.FC = () => {
	return (
		<header className="bg-transparent py-4 sm:py-5 px-3 sm:px-8 md:px-10 sticky top-0 flex justify-center ">
			<nav className="flex items-center gap-1 sm:gap-5 px-2 sm:px-8 sm:pr-4 py-2 bg-black-bch/75 z-10 w-full rounded-full max-w-[1200px] shadow-xl backdrop-blur-xs">
				<h1 className="font-bold italic text-base sm:text-2xl text-white-bch">
					BCH Connect example
				</h1>
				<div className="flex grow items-center justify-start">
					<a
						href="https://github.com/fran-dv/bch-connect"
						target="_blank"
						className="text-white-bch hidden sm:block"
						title="GitHub link"
						aria-label="GitHub link"
						rel="noopener"
					>
						<GitHubLogoIcon className="w-8 h-auto aspect-square hover:scale-105 transition-transform duration-300" />
					</a>
				</div>

				<ConnectButton />
			</nav>
		</header>
	);
};

export default Navbar;
