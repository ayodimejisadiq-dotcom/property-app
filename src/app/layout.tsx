import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { AnnouncementBar } from "@/components/app/AnnouncementBar";
import { CookieBanner } from "@/components/app/CookieBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://capora.co.uk";
const SITE_URL = /^https?:\/\//i.test(RAW_SITE_URL)
  ? RAW_SITE_URL
  : `https://${RAW_SITE_URL}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Capora — Score property deals in seconds",
    template: "%s · Capora",
  },
  description:
    "A 0–100 score and plain-English report on every UK BTL deal. Built for landlords, not algorithms. Not financial advice.",
  applicationName: "Capora",
  keywords: [
    "UK property",
    "BTL",
    "buy to let",
    "deal analyser",
    "property investment",
    "Rightmove",
    "Zoopla",
  ],
  authors: [{ name: "Capora" }],
  openGraph: {
    type: "website",
    title: "Capora — Score property deals in seconds",
    description:
      "A 0–100 score and plain-English report on every UK BTL deal. Five reports a month, free.",
    siteName: "Capora",
    locale: "en_GB",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Capora — Score property deals in seconds",
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
    <html
      lang="en"
      className={`${inter.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-body">
        <ToastProvider>
          <AnnouncementBar
            message={
              <>
                <span className="font-semibold">Free during early access</span>
                <span className="opacity-80"> — 5 reports a month, no card.</span>
              </>
            }
            href="/billing"
            ctaLabel="See plans"
          />
          {children}
          <CookieBanner />
        </ToastProvider>
      </body>
    </html>
  );
}
