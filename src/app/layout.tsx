import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/components/designs/themes.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FixIt - AI-Powered Accessibility Auditor",
  description: "Audit any website for accessibility and SEO issues. Get AI-powered fixes and open a pull request automatically.",
  openGraph: {
    title: "FixIt - AI-Powered Accessibility Auditor",
    description: "Audit any website for accessibility and SEO issues. Get AI-powered fixes and open a pull request automatically.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-zinc-950 text-zinc-50`}
      >
        {children}
      </body>
    </html>
  );
}
