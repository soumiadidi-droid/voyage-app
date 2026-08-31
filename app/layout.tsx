import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Source_Serif_4,
  IBM_Plex_Mono,
  Give_You_Glory,
  Cormorant_Garamond,
} from "next/font/google";
import "./globals.css";
import { Nav, Footer } from "./components/NavFooter";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const giveYouGlory = Give_You_Glory({
  variable: "--font-give-you-glory",
  subsets: ["latin"],
  weight: "400",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "500"],
});

// metadataBase (31/08/2026, ajout OG tags) — nécessaire pour que Next résolve les URLs
// openGraph.images en absolu. URL de prod confirmée dans ce même CLAUDE.md ("État actuel").
export const metadata: Metadata = {
  metadataBase: new URL("https://voyage-app-sage.vercel.app"),
  title: "Le Voyage des Émotions",
  description: "Un pays, une histoire, une photo à la fois.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${bricolage.variable} ${sourceSerif.variable} ${ibmPlexMono.variable} ${giveYouGlory.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
