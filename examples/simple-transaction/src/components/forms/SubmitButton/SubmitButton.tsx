import clsx from "clsx";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const SubmitButton: React.FC<Props> = ({
  children,
  className,
  ...rest
}: Props) => {
  return (
    <button
      type="submit"
      className={clsx(
        "flex items-center gap-2 text-white-bch cursor-pointer bg-green-bch w-full px-4 py-2 rounded-full justify-center text-lg font-bold uppercase",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

export default SubmitButton;
