import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moja kutija",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: LayoutProps<"/kutija">) {
  return children;
}
