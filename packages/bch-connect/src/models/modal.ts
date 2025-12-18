import type { NETWORK_INDEX, SessionType } from "./config";

export interface Modal {
  open(options: { uri: string }): Promise<void> | void;
  close(): Promise<void> | void;
}

// Interface primarily for Reown's AppKit modal
export interface ModalFactoryContext {
  projectId: string;
  network: NETWORK_INDEX | keyof typeof NETWORK_INDEX;
  sessionType: SessionType;
}

export type ModalFactory = (
  context: ModalFactoryContext,
) => Modal | Promise<Modal>;
