import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BoxProvider } from "@/context/BoxContext";
import { RecipeProvider } from "@/context/RecipeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KutijaObroka — meal-kit dostava",
  description: "Prototip aplikacije za dostavu obroka po uzoru na HelloFresh.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="sr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
        <RecipeProvider>
          <BoxProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </BoxProvider>
        </RecipeProvider>
      </body>
    </html>
  );
}
