import { create } from "zustand";

interface ToastState {
  open: boolean;
  title?: string;
  description?: string;
}

interface ToastActions {
  openToast: (params: { title?: string; description: string }) => void;
  setOpen: (open: boolean) => void;
}

export const useToastStore = create<ToastState & ToastActions>((set) => ({
  open: false,
  title: undefined,
  description: undefined,
  openToast: ({ title, description }) =>
    set({ open: true, title, description }),
  setOpen: (open) => set({ open }),
}));

export default useToastStore;
