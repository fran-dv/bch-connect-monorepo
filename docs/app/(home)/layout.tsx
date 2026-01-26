import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";
import { BCHConnectWrapper } from "./components/BCHConnectWrapper";

export default function Layout({ children }: LayoutProps<"/">) {
	return (
		<HomeLayout {...baseOptions()}>
			<BCHConnectWrapper>{children}</BCHConnectWrapper>
		</HomeLayout>
	);
}
