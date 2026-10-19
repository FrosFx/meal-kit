import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { BoxProvider } from "@/context/BoxContext";
import { RecipeProvider } from "@/context/RecipeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSiteUrl } from "@/lib/site";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const description =
  "Izmereni sastojci i jednostavni recepti dostavljeni na kućnu adresu. Izaberi plan i obroke iz nedeljnog menija — gotovo za manje od 30 minuta.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "KutijaObroka — sveži obroci na tvojim vratima",
    template: "%s | KutijaObroka",
  },
  description,
  openGraph: {
    type: "website",
    locale: "sr_RS",
    siteName: "KutijaObroka",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="sr"
      className={`${fraunces.variable} ${instrumentSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <noscript>
          <style>{`.reveal[data-revealed="false"]{opacity:1;transform:none}`}</style>
        </noscript>
        <div className="grain" aria-hidden="true" />
        <RecipeProvider>
          <BoxProvider>
            <Navbar />
            <main id="sadrzaj" tabIndex={-1} className="relative flex-1 outline-none">
              {children}
            </main>
            <Footer />
          </BoxProvider>
        </RecipeProvider>
      </body>
    </html>
  );
}
