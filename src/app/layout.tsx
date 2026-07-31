import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import {
  PlaceholderNotice,
  SiteFooter,
  SkipLink,
} from "@/components/SiteChrome";
import { site } from "@/content/site";
import "./globals.css";

// Contemporary grotesk for display and body, with a tabular mono for
// coordinates and the story progress readout. Swap for the licensed brand
// typeface once one is confirmed.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.positioning}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.name} — ${site.positioning}`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // data-scroll-behavior keeps Next 16 overriding smooth scrolling during
    // route transitions, so navigation stays instant while in-page anchors
    // still animate.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <SkipLink />
        <PlaceholderNotice />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
