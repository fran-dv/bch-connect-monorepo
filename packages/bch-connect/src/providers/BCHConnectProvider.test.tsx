import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";

import { BCHConnectProvider } from "./BCHConnectProvider";
import { useWalletConnectContext } from "@/contexts/WalletConnectContext";
import * as configModule from "@/config/config";
import { NETWORK_INDEX, type Configuration } from "@/models/config";
import type { SessionTypes } from "@walletconnect/types";

type MockSignClient = {
  on: Mock;
  removeListener: Mock;
  connect: Mock;
  disconnect: Mock;
  session: {
    getAll: Mock;
  };
};

type MockModal = {
  open: Mock;
  close: Mock;
};

vi.mock("@/config/config", async (importOriginal) => {
  const actual = await importOriginal<typeof configModule>();
  return {
    ...actual,
    initializeConnection: vi.fn(),
    getNamespaces: vi.fn().mockReturnValue({ bch: {} }),
  };
});

const mockConfig: Configuration = {
  projectId: "test-project",
  network: NETWORK_INDEX.mainnet,
  metadata: {
    name: "Test",
    description: "Test",
    url: "https://test.com",
    icons: [],
  },
  debug: false,
  supportLegacyClient: false,
};

const mockSession = {
  topic: "test-topic",
  namespaces: {
    bch: { accounts: ["bch:test-address"] },
  },
} as unknown as SessionTypes.Struct;

const TestConsumer = () => {
  const {
    session,
    connect,
    disconnect,
    signClient,
    connectError,
    disconnectError,
  } = useWalletConnectContext();

  return (
    <div>
      <div data-testid="session-topic">{session?.topic ?? "no-session"}</div>
      <div data-testid="client-status">
        {signClient ? "initialized" : "pending"}
      </div>
      <div data-testid="connect-error">
        {connectError?.message ?? "no-connect-error"}
      </div>
      <div data-testid="disconnect-error">
        {disconnectError?.message ?? "no-disconnect-error"}
      </div>
      <button onClick={() => connect()}>Connect</button>
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  );
};

const createMockSignClient = (): MockSignClient => ({
  on: vi.fn(),
  removeListener: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  session: {
    getAll: vi.fn().mockReturnValue([]),
  },
});

const createMockModal = (): MockModal => ({
  open: vi.fn(),
  close: vi.fn(),
});

describe("BCHConnectProvider", () => {
  let mockClient: MockSignClient;
  let mockModal: MockModal;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = createMockSignClient();
    mockModal = createMockModal();

    vi.spyOn(configModule, "initializeConnection").mockResolvedValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      signClient: mockClient as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      modal: mockModal as any,
    });

    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes connection on mount and exposes the signClient", async () => {
    render(
      <BCHConnectProvider config={mockConfig}>
        <TestConsumer />
      </BCHConnectProvider>,
    );

    expect(configModule.initializeConnection).toHaveBeenCalledWith(mockConfig);

    await waitFor(() => {
      expect(screen.getByTestId("client-status")).toHaveTextContent(
        "initialized",
      );
    });
  });

  it("hydrates an existing session on initialization", async () => {
    mockClient.session.getAll.mockReturnValue([mockSession]);

    render(
      <BCHConnectProvider config={mockConfig}>
        <TestConsumer />
      </BCHConnectProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("session-topic")).toHaveTextContent(
        mockSession.topic,
      );
    });
  });

  it("handles initialization failure gracefully and sets connectError", async () => {
    const initError = new Error("Network Init Failed");
    vi.spyOn(configModule, "initializeConnection").mockRejectedValue(initError);

    render(
      <BCHConnectProvider config={{ ...mockConfig, debug: true }}>
        <TestConsumer />
      </BCHConnectProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("client-status")).toHaveTextContent("pending");
      expect(screen.getByTestId("connect-error")).toHaveTextContent(
        "Network Init Failed",
      );
    });
  });

  it("prevents double initialization using refs (Strict Mode simulation)", async () => {
    const { rerender } = render(
      <BCHConnectProvider config={mockConfig}>
        <TestConsumer />
      </BCHConnectProvider>,
    );

    rerender(
      <BCHConnectProvider config={mockConfig}>
        <TestConsumer />
      </BCHConnectProvider>,
    );

    expect(configModule.initializeConnection).toHaveBeenCalledTimes(1);
  });

  describe("Connect Flow", () => {
    it("orchestrates the connection (Client Connect -> Modal Open -> Approval)", async () => {
      const mockApproval = vi.fn().mockResolvedValue(mockSession);

      mockClient.connect.mockResolvedValue({
        uri: "wc:test-uri",
        approval: mockApproval,
      });

      render(
        <BCHConnectProvider config={mockConfig}>
          <TestConsumer />
        </BCHConnectProvider>,
      );

      await waitFor(() =>
        expect(screen.getByTestId("client-status")).toHaveTextContent(
          "initialized",
        ),
      );

      await act(async () => {
        fireEvent.click(screen.getByText("Connect"));
      });

      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockModal.open).toHaveBeenCalledWith({ uri: "wc:test-uri" });
      expect(mockApproval).toHaveBeenCalled();

      expect(mockModal.close).toHaveBeenCalled();
      expect(screen.getByTestId("session-topic")).toHaveTextContent(
        mockSession.topic,
      );
      expect(screen.getByTestId("connect-error")).toHaveTextContent(
        "no-connect-error",
      );
    });

    it("handles failure when client.connect returns no URI", async () => {
      mockClient.connect.mockResolvedValue({
        uri: null,
        approval: vi.fn(),
      });

      render(
        <BCHConnectProvider config={mockConfig}>
          <TestConsumer />
        </BCHConnectProvider>,
      );

      await waitFor(() =>
        expect(screen.getByTestId("client-status")).toHaveTextContent(
          "initialized",
        ),
      );

      await act(async () => {
        fireEvent.click(screen.getByText("Connect"));
      });

      expect(mockModal.open).not.toHaveBeenCalled();
      expect(screen.getByTestId("connect-error")).toHaveTextContent(
        "Failed to connect to sign client: No URI",
      );
    });

    it("handles failure when user rejects approval (throws error)", async () => {
      mockClient.connect.mockResolvedValue({
        uri: "wc:test-uri",
        approval: vi.fn().mockRejectedValue(new Error("User rejected")),
      });

      render(
        <BCHConnectProvider config={mockConfig}>
          <TestConsumer />
        </BCHConnectProvider>,
      );

      await waitFor(() =>
        expect(screen.getByTestId("client-status")).toHaveTextContent(
          "initialized",
        ),
      );

      await act(async () => {
        fireEvent.click(screen.getByText("Connect"));
      });

      expect(mockModal.open).toHaveBeenCalled();
      expect(screen.getByTestId("connect-error")).toHaveTextContent(
        "User rejected",
      );
      expect(mockModal.close).toHaveBeenCalled();
    });
  });

  describe("Disconnect Flow", () => {
    it("clears the session on successful disconnect", async () => {
      mockClient.session.getAll.mockReturnValue([mockSession]);

      render(
        <BCHConnectProvider config={mockConfig}>
          <TestConsumer />
        </BCHConnectProvider>,
      );

      await waitFor(() =>
        expect(screen.getByTestId("session-topic")).toHaveTextContent(
          mockSession.topic,
        ),
      );

      await act(async () => {
        fireEvent.click(screen.getByText("Disconnect"));
      });

      expect(mockClient.disconnect).toHaveBeenCalledWith({
        topic: mockSession.topic,
        reason: expect.objectContaining({ message: "User disconnected" }),
      });

      expect(screen.getByTestId("session-topic")).toHaveTextContent(
        "no-session",
      );
      expect(screen.getByTestId("disconnect-error")).toHaveTextContent(
        "no-disconnect-error",
      );
    });

    it("handles disconnect error when no active session exists", async () => {
      render(
        <BCHConnectProvider config={mockConfig}>
          <TestConsumer />
        </BCHConnectProvider>,
      );

      await waitFor(() =>
        expect(screen.getByTestId("client-status")).toHaveTextContent(
          "initialized",
        ),
      );

      await act(async () => {
        fireEvent.click(screen.getByText("Disconnect"));
      });

      expect(mockClient.disconnect).not.toHaveBeenCalled();
      expect(screen.getByTestId("disconnect-error")).toHaveTextContent(
        "No active session",
      );
    });

    it("handles underlying client disconnect failure", async () => {
      mockClient.session.getAll.mockReturnValue([mockSession]);
      mockClient.disconnect.mockRejectedValue(new Error("Network Error"));

      render(
        <BCHConnectProvider config={{ ...mockConfig, debug: true }}>
          <TestConsumer />
        </BCHConnectProvider>,
      );

      await waitFor(() =>
        expect(screen.getByTestId("session-topic")).toHaveTextContent(
          mockSession.topic,
        ),
      );

      await act(async () => {
        fireEvent.click(screen.getByText("Disconnect"));
      });

      expect(screen.getByTestId("disconnect-error")).toHaveTextContent(
        "Network Error",
      );
    });
  });

  describe("Event Listeners", () => {
    it("binds listeners on mount and unbinds on unmount", async () => {
      const { unmount } = render(
        <BCHConnectProvider config={mockConfig}>
          <TestConsumer />
        </BCHConnectProvider>,
      );

      await waitFor(() =>
        expect(screen.getByTestId("client-status")).toHaveTextContent(
          "initialized",
        ),
      );

      expect(mockClient.on).toHaveBeenCalledWith(
        "session_delete",
        expect.any(Function),
      );
      expect(mockClient.on).toHaveBeenCalledWith(
        "session_update",
        expect.any(Function),
      );

      unmount();

      expect(mockClient.removeListener).toHaveBeenCalledWith(
        "session_delete",
        expect.any(Function),
      );
    });

    it("responds to session_delete event by clearing session", async () => {
      mockClient.session.getAll.mockReturnValue([mockSession]);

      render(
        <BCHConnectProvider config={mockConfig}>
          <TestConsumer />
        </BCHConnectProvider>,
      );

      await waitFor(() =>
        expect(screen.getByTestId("session-topic")).toHaveTextContent(
          mockSession.topic,
        ),
      );

      const deleteCall = mockClient.on.mock.calls.find(
        (call) => call[0] === "session_delete",
      );
      expect(deleteCall).toBeDefined();
      const callback = deleteCall![1];

      await act(async () => {
        callback({ topic: mockSession.topic });
      });

      expect(screen.getByTestId("session-topic")).toHaveTextContent(
        "no-session",
      );
    });

    it("responds to session_update event by updating session", async () => {
      mockClient.session.getAll.mockReturnValue([mockSession]);

      render(
        <BCHConnectProvider config={mockConfig}>
          <TestConsumer />
        </BCHConnectProvider>,
      );

      await waitFor(() =>
        expect(screen.getByTestId("session-topic")).toHaveTextContent(
          mockSession.topic,
        ),
      );

      const updateCall = mockClient.on.mock.calls.find(
        (call) => call[0] === "session_update",
      );
      const callback = updateCall![1];

      const updatedSession = {
        ...mockSession,
        namespaces: { bch: { accounts: ["bch:NEW-ADDRESS"] } },
      };

      mockClient.session.getAll.mockReturnValue([updatedSession]);

      await act(async () => {
        callback({
          topic: mockSession.topic,
          params: { namespaces: updatedSession.namespaces },
        });
      });
    });
  });

  describe("Configuration & Debugging Branches", () => {
    it("logs debug messages when config.debug is TRUE", async () => {
      // Spy on console methods
      const consoleLogSpy = vi.spyOn(console, "log");
      const consoleErrorSpy = vi.spyOn(console, "error");

      render(
        <BCHConnectProvider config={{ ...mockConfig, debug: true }}>
          <TestConsumer />
        </BCHConnectProvider>,
      );

      await waitFor(() =>
        expect(screen.getByTestId("client-status")).toHaveTextContent(
          "initialized",
        ),
      );

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("SIGN CLIENT AND MODAL INITIALIZED"),
      );

      mockClient.connect.mockResolvedValue({
        uri: "wc:debug-uri",
        approval: vi.fn().mockResolvedValue(mockSession),
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Connect"));
      });

      expect(consoleLogSpy).toHaveBeenCalledWith("URI: ", "wc:debug-uri");
      expect(consoleLogSpy).toHaveBeenCalledWith("NEW SESSION: ", mockSession);

      await act(async () => {
        fireEvent.click(screen.getByText("Disconnect"));
      });
      expect(consoleLogSpy).toHaveBeenCalledWith("DISCONNECTED");

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it("correctly handles Legacy Client (OldSignClient) type assertions", async () => {
      const oldSession = {
        ...mockSession,
      };

      mockClient.session.getAll.mockReturnValue([oldSession]);

      render(
        <BCHConnectProvider
          config={{ ...mockConfig, supportLegacyClient: true }}
        >
          <TestConsumer />
        </BCHConnectProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("session-topic")).toHaveTextContent(
          oldSession.topic,
        );
      });
    });
  });
});
