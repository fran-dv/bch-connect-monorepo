import useUserMessages from "@/hooks/useUserMessages";
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import { useState } from "react";

interface Props {
  address: string;
  full?: boolean;
}

export const Address: React.FC<Props> = ({ address, full = false }: Props) => {
  const [copied, setCopied] = useState(false);
  const { showSuccess, showError } = useUserMessages();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      showSuccess("Address copied to clipboard");
    } catch (err) {
      console.error("Failed to copy address:", err);
      showError("Failed to copy address");
    }
  };

  if (!address) return null;

  const display = full
    ? address
    : `${address.replace("bchtest:", "").slice(0, 6)}...${address.slice(-6)}`;
  return (
    <span
      onClick={handleCopy}
      className="cursor-pointer inline-flex align-middle gap-2"
    >
      <span>{display}</span>
      <span className="flex items-center">
        {copied ? (
          <CheckIcon className="w-4 h-auto aspect-square" />
        ) : (
          <CopyIcon className="w-4 h-auto aspect-square" />
        )}
      </span>
    </span>
  );
};
