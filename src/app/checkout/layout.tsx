import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plaćanje",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: LayoutProps<"/checkout">) {
  return children;
}
