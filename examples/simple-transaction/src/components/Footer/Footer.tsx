import { GitHubLogoIcon } from "@radix-ui/react-icons";

export const Footer: React.FC = () => {
  return (
    <footer>
      <a
        href="https://github.com/fran-dv/bch-connect"
        target="_blank"
        className="text-white-bch fixed bottom-4 right-4 block sm:hidden"
        title="GitHub link"
        aria-label="GitHub link"
      >
        <GitHubLogoIcon className="w-10 h-auto aspect-square hover:scale-105 transition-transform duration-300" />
      </a>
    </footer>
  );
};
