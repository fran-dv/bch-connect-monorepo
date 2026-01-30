import * as Toast from "@radix-ui/react-toast";
import { Background } from "@/components/Background";
import { Example } from "@/components/Example";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ToastMessages } from "@/components/ToastMessages";

function App() {
	return (
		<Toast.Provider swipeDirection="left">
			<Background />
			<Navbar />

			<main className={"p-3 sm:p-4 md:p-6 lg:p-8 w-full"}>
				<Example />
			</main>

			<Footer />
			<ToastMessages />
		</Toast.Provider>
	);
}

export default App;
