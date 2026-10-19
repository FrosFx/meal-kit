import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin panel",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: LayoutProps<"/admin">) {
  return children;
}
