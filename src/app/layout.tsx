import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import CustomCursor from "@/components/CustomCursor";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "FlowVenue | Smart Stadium Command",
  description: "AI-powered real-time smart stadium experience mapping algorithms and operator interfaces.",
  openGraph: {
    title: "FlowVenue | Command",
    description: "Real-time Stadium Telemetry Simulator",
    images: [{ url: "/og-image.jpg" }],
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${dmSans.variable} ${syne.variable} font-body antialiased bg-navy text-white min-h-screen flex flex-col`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-electric focus:text-navy focus:font-bold">
          Skip to main content
        </a>
        <Providers>
          <ErrorBoundary>
            <CustomCursor />
            <Navbar />
            <main id="main-content" className="flex-1 flex flex-col">
              {children}
            </main>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
