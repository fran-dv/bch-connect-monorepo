import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import Image from "next/image";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <DocsLayout
      tree={source.pageTree}
      sidebar={{
        tabs: [
          {
            title: "React docs",
            description: "BCH Connect for React projects",
            url: "/docs/react",
            icon: (
              <Image
                src="/images/logos/react.svg"
                alt="React Logo"
                width={40}
                height={40}
              />
            ),
          },
        ],
      }}
      {...baseOptions()}
    >
      {children}
    </DocsLayout>
  );
}
