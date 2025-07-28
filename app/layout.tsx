import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Canadian Resource Job Board",
    template: "%s | Canadian Resource Job Board"
  },
  description: "Find career opportunities in Canada's resource sectors including mining, oil & gas, forestry, and renewable energy. Browse jobs across all provinces.",
  keywords: ["Canadian jobs", "resource sector", "mining jobs", "oil gas jobs", "forestry jobs", "energy jobs", "Canada employment"],
  authors: [{ name: "Canadian Resource Job Board" }],
  creator: "Canadian Resource Job Board",
  publisher: "Canadian Resource Job Board",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://canadian-resourse-jobboard.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Canadian Resource Job Board",
    description: "Find career opportunities in Canada's resource sectors including mining, oil & gas, forestry, and renewable energy.",
    url: "https://canadian-resourse-jobboard.vercel.app",
    siteName: "Canadian Resource Job Board",
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Canadian Resource Job Board",
    description: "Find career opportunities in Canada's resource sectors including mining, oil & gas, forestry, and renewable energy.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
