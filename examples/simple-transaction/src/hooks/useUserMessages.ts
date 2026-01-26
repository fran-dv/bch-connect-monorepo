import { useToastStore } from "@/stores/useToastStore";

export interface UseUserMessagesReturnType {
	showError: (message: string) => void;
	showSuccess: (message: string) => void;
	showMessage: (message: string) => void;
}

export const useUserMessages = (): UseUserMessagesReturnType => {
	const { openToast } = useToastStore();

	const showError = (message: string) => {
		openToast({ description: `❌ ${message}` });
	};

	const showSuccess = (message: string) => {
		openToast({ description: `✅ ${message}` });
	};

	const showMessage = (message: string) => {
		openToast({ description: `⚠️ ${message}` });
	};

	return {
		showError,
		showSuccess,
		showMessage,
	};
};

export default useUserMessages;
