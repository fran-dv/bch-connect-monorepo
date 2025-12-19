import * as Toast from "@radix-ui/react-toast";
import styles from "./ToastMessages.module.css";
import { useToastStore } from "@/stores/useToastStore";

export const ToastMessages: React.FC = () => {
  const { open, setOpen, title, description } = useToastStore();

  return (
    <>
      <Toast.Root open={open} onOpenChange={setOpen} className={styles.root}>
        {title && <Toast.Title className={styles.title}>{title}</Toast.Title>}
        <Toast.Description className={styles.description}>
          {description}
        </Toast.Description>
      </Toast.Root>
      <Toast.Viewport className={styles.viewport} />
    </>
  );
};

export default ToastMessages;
