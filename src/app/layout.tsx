import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthLayout from "@/components/AuthLayout";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BharatLearn Dev Coach",
  description: "AI-powered CS learning platform — Learn faster, debug smarter, ace your viva.",
  keywords: ["AI learning", "CS tutor", "code debugging", "quiz generator", "viva prep"],
  openGraph: {
    title: "BharatLearn Dev Coach",
    description: "AI-powered CS learning platform",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body className="font-sans">
        <AuthLayout>{children}</AuthLayout>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
