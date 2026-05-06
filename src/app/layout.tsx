import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://dealscope.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dealscope — Score property deals in seconds",
    template: "%s · Dealscope",
  },
  description:
    "A 0–100 score and plain-English report on every UK BTL deal. Built for landlords, not algorithms. Not financial advice.",
  applicationName: "Dealscope",
  keywords: [
    "UK property",
    "BTL",
    "buy to let",
    "deal analyser",
    "property investment",
    "Rightmove",
    "Zoopla",
  ],
  authors: [{ name: "Daramola Consulting" }],
  openGraph: {
    type: "website",
    title: "Dealscope — Score property deals in seconds",
    description:
      "A 0–100 score and plain-English report on every UK BTL deal. Five reports a month, free.",
    siteName: "Dealscope",
    locale: "en_GB",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Dealscope — Score property deals in seconds",
    description:
      "A 0–100 score on every UK BTL deal. Built for landlords, not algorithms.",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4F46E5",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-body">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
