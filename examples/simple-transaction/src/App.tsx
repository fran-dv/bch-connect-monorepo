import { Example } from "@/components/Example";
import { Background } from "@/components/Background";
import { Navbar } from "@/components/Navbar";
import * as Toast from "@radix-ui/react-toast";
import { ToastMessages } from "@/components/ToastMessages";
import useNetworkProviderStore from "@/stores/useNetworkProviderStore";
import { useEffect } from "react";
import { ElectrumNetworkProvider } from "cashscript";
import { Footer } from "@/components/Footer";
import { currentNetwork } from "./main";

function App() {
  const { setProvider } = useNetworkProviderStore();
  const network = currentNetwork === "testnet" ? "chipnet" : "mainnet";

  useEffect(() => {
    setProvider(new ElectrumNetworkProvider(network));
  }, [setProvider, network]);

  return (
    <>
      <Toast.Provider swipeDirection="left">
        <Background />
        <Navbar />

        <main className={"p-3 sm:p-4 md:p-6 lg:p-8 w-full"}>
          <Example />
        </main>

        <Footer />
        <ToastMessages />
      </Toast.Provider>
    </>
  );
}

export default App;
